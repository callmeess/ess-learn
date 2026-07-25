using EssLearn.Application.Dtos.BlobStorage;
using EssLearn.Application.Services.BlobStorage;
using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace EssLearn.Api.Services;

public partial class TranscodeJobProcessor : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<TranscodeJobProcessor> _logger;
    private readonly TimeSpan _pollInterval = TimeSpan.FromSeconds(2);

    public TranscodeJobProcessor(IServiceProvider serviceProvider, ILogger<TranscodeJobProcessor> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("TranscodeJobProcessor started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessPendingJobsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in TranscodeJobProcessor loop.");
            }

            await Task.Delay(_pollInterval, stoppingToken);
        }

        _logger.LogInformation("TranscodeJobProcessor stopped.");
    }

    private async Task ProcessPendingJobsAsync(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var blobStorage = scope.ServiceProvider.GetRequiredService<IBlobStorageService>();
        var blobOptions = scope.ServiceProvider.GetRequiredService<BlobStorageOptions>();

        var pendingJob = await dbContext.TranscodeJobs
            .Include(j => j.Video).ThenInclude(v => v.Playlist)
            .Include(j => j.DownloadedVideo)
            .Where(j => j.Status == TranscodeJobStatus.Pending)
            .OrderBy(j => j.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (pendingJob == null)
            return;

        if (pendingJob.DownloadedVideo is null)
        {
            _logger.LogError("Transcode job {JobId} has no associated DownloadedVideo.", pendingJob.Id);
            pendingJob.Status = TranscodeJobStatus.Failed;
            pendingJob.ErrorMessage = "Associated downloaded video not found.";
            await dbContext.SaveChangesAsync(ct);
            return;
        }

        if (pendingJob.Video?.Playlist is null)
        {
            _logger.LogError("Transcode job {JobId} has no associated Playlist.", pendingJob.Id);
            pendingJob.Status = TranscodeJobStatus.Failed;
            pendingJob.ErrorMessage = "Associated playlist not found.";
            await dbContext.SaveChangesAsync(ct);
            return;
        }

        _logger.LogInformation("Processing transcode job {JobId} for video {VideoId}", pendingJob.Id, pendingJob.VideoId);

        pendingJob.Status = TranscodeJobStatus.Transcoding;
        await dbContext.SaveChangesAsync(ct);

        var tempDir = Path.Combine(Path.GetTempPath(), $"transcode_{pendingJob.VideoId}_{DateTime.UtcNow.Ticks}");
        Directory.CreateDirectory(tempDir);

        try
        {
            // Step 1: Download source video from MinIO
            var sourcePath = pendingJob.DownloadedVideo.BlobPath;
            if (string.IsNullOrEmpty(sourcePath))
                throw new InvalidOperationException("Downloaded video has no blob path.");

            _logger.LogInformation("Downloading source video from {Bucket}/{Path}", pendingJob.DownloadedVideo.BlobBucket, sourcePath);

            var sourceStream = await blobStorage.DownloadFileAsync(pendingJob.DownloadedVideo.BlobBucket, sourcePath);

            var container = pendingJob.DownloadedVideo.Container;
            if (string.IsNullOrWhiteSpace(container))
                container = "mp4";

            var inputPath = Path.Combine(tempDir, $"input.{container}");

            await using (var fileStream = File.Create(inputPath))
            {
                await sourceStream.CopyToAsync(fileStream, ct);
            }
            await sourceStream.DisposeAsync();

            // Step 2: Run ffmpeg to produce HLS
            var outputDir = Path.Combine(tempDir, "hls");
            Directory.CreateDirectory(outputDir);

            var manifestPath = Path.Combine(outputDir, "master.m3u8");
            var segmentPattern = Path.Combine(outputDir, "%03d.ts");

            _logger.LogInformation("Starting ffmpeg transcoding for video {VideoId}", pendingJob.VideoId);

            var ffmpegArgs = $"-i \"{inputPath}\" " +
                             $"-c:v libx264 -preset fast -crf 23 " +
                             $"-c:a aac -b:a 128k " +
                             $"-f hls -hls_time 6 -hls_list_size 0 " +
                             $"-hls_segment_filename \"{segmentPattern}\" " +
                             $"\"{manifestPath}\"";

            var totalDuration = pendingJob.Video.DurationSeconds;
            await RunFfmpegAsync(ffmpegArgs, totalDuration, p =>
            {
                pendingJob.ProgressPercent = p;
            }, ct);

            // Step 3: Upload HLS files to MinIO
            pendingJob.Status = TranscodeJobStatus.Uploading;
            pendingJob.ProgressPercent = 0;
            await dbContext.SaveChangesAsync(ct);

            var video = pendingJob.Video;
            var hlsManifestPath = BlobPathBuilder.HlsManifestPath(
                video.Playlist.FieldId, video.PlaylistId, video.Id);
            var hlsSegmentsPrefix = BlobPathBuilder.HlsSegmentsPath(
                video.Playlist.FieldId, video.PlaylistId, video.Id);

            // Rewrite segment paths in manifest to include segments/ prefix
            // so HLS player resolves 000.ts → segments/000.ts to match the route
            var manifestContent = await File.ReadAllTextAsync(manifestPath, ct);
            manifestContent = ManifestSegmentPathRegex().Replace(manifestContent, "segments/$1");
            var manifestBytes = Encoding.UTF8.GetBytes(manifestContent);

            using (var manifestStream = new MemoryStream(manifestBytes))
            {
                var manifestResult = await blobStorage.UploadFileAsync(
                    blobOptions.Buckets.Videos,
                    hlsManifestPath,
                    manifestStream,
                    manifestBytes.Length,
                    "application/vnd.apple.mpegurl");

                if (!manifestResult.Success)
                    throw new InvalidOperationException($"Manifest upload failed: {manifestResult.ErrorMessage}");
            }

            // Upload segments
            var segmentFiles = Directory.GetFiles(outputDir, "*.ts");
            long totalSize = manifestBytes.Length;
            var segmentCount = 0;

            foreach (var segmentFile in segmentFiles)
            {
                var segmentName = Path.GetFileName(segmentFile);
                var segmentBlobPath = BlobPathBuilder.HlsSegmentPath(
                    video.Playlist.FieldId, video.PlaylistId, video.Id, segmentName);

                var segmentBytes = await File.ReadAllBytesAsync(segmentFile, ct);
                using var segmentStream = new MemoryStream(segmentBytes);

                var segmentResult = await blobStorage.UploadFileAsync(
                    blobOptions.Buckets.Videos,
                    segmentBlobPath,
                    segmentStream,
                    segmentBytes.Length,
                    "video/mp2t");

                if (!segmentResult.Success)
                    _logger.LogWarning("Failed to upload segment {Segment}: {Error}", segmentName, segmentResult.ErrorMessage);

                totalSize += segmentBytes.Length;
                segmentCount++;
            }

            // Step 4: Save TranscodedVideo record
            var transcodedVideo = new TranscodedVideo
            {
                VideoId = video.Id,
                DownloadedVideoId = pendingJob.DownloadedVideoId,
                HlsManifestBlobPath = hlsManifestPath,
                HlsSegmentsBlobPath = hlsSegmentsPrefix,
                BlobBucket = blobOptions.Buckets.Videos,
                SegmentCount = segmentCount,
                TotalSizeBytes = totalSize,
                TranscodedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            dbContext.TranscodedVideos.Add(transcodedVideo);

            // Step 5: Mark job completed
            pendingJob.Status = TranscodeJobStatus.Completed;
            pendingJob.ProgressPercent = 100;
            pendingJob.CompletedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync(ct);

            _logger.LogInformation("Transcode job {JobId} completed. {Segments} segments, {Size} bytes",
                pendingJob.Id, segmentCount, totalSize);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Transcode job {JobId} failed.", pendingJob.Id);
            pendingJob.Status = TranscodeJobStatus.Failed;
            pendingJob.ErrorMessage = ex.Message;
            await dbContext.SaveChangesAsync(ct);
        }
        finally
        {
            CleanupTempDir(tempDir);
        }
    }

    private async Task RunFfmpegAsync(string arguments, int totalDurationSeconds, Action<double> onProgress, CancellationToken ct)
    {
        var ffmpegPath = await FindFfmpegAsync();

        var process = new Process
        {
            StartInfo = new ProcessStartInfo
            {
                FileName = ffmpegPath,
                Arguments = arguments,
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            }
        };

        process.Start();

        var stderrTask = ReadFfmpegProgressAsync(process, totalDurationSeconds, onProgress, ct);
        var stdoutTask = process.StandardOutput.ReadToEndAsync(ct);

        await Task.WhenAll(stderrTask, stdoutTask);
        await process.WaitForExitAsync(ct);

        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException($"ffmpeg exited with code {process.ExitCode}");
        }
    }

    private static async Task ReadFfmpegProgressAsync(Process process, int totalDurationSeconds, Action<double> onProgress, CancellationToken ct)
    {
        if (totalDurationSeconds <= 0)
        {
            await process.StandardError.ReadToEndAsync(ct);
            return;
        }

        var timeRegex = FfmpegTimeRegex();
        var lastReportedProgress = -1.0;

        while (!process.StandardError.EndOfStream && !ct.IsCancellationRequested)
        {
            var line = await process.StandardError.ReadLineAsync(ct);
            if (line == null)
                break;

            var match = timeRegex.Match(line);
            if (match.Success && TimeSpan.TryParse(match.Groups[1].Value, CultureInfo.InvariantCulture, out var currentTime))
            {
                var progress = Math.Min(99.0, (currentTime.TotalSeconds / totalDurationSeconds) * 100.0);
                if (Math.Abs(progress - lastReportedProgress) >= 1.0)
                {
                    onProgress(Math.Round(progress, 1));
                    lastReportedProgress = progress;
                }
            }
        }
    }

    [GeneratedRegex(@"time=(\d{2}:\d{2}:\d{2}\.\d{2})")]
    private static partial Regex FfmpegTimeRegex();

    [GeneratedRegex(@"^([\w-]+\.ts)$", RegexOptions.Multiline)]
    private static partial Regex ManifestSegmentPathRegex();

    private static async Task<string> FindFfmpegAsync()
    {
        string[] paths = ["/usr/bin/ffmpeg", "/usr/local/bin/ffmpeg", "ffmpeg"];
        foreach (var path in paths)
        {
            try
            {
                var process = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = path,
                        Arguments = "-version",
                        RedirectStandardOutput = true,
                        UseShellExecute = false,
                        CreateNoWindow = true
                    }
                };
                process.Start();
                await process.WaitForExitAsync();
                if (process.ExitCode == 0) return path;
            }
            catch
            {
            }
        }

        throw new InvalidOperationException("ffmpeg not found in PATH or common locations.");
    }

    private void CleanupTempDir(string tempDir)
    {
        try
        {
            if (Directory.Exists(tempDir))
                Directory.Delete(tempDir, recursive: true);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to clean up temp directory: {TempDir}", tempDir);
        }
    }
}
