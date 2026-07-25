using EssLearn.Application.Dtos;
using EssLearn.Application.Dtos.BlobStorage;
using EssLearn.Application.Services.BlobStorage;
using EssLearn.Core.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
using EssLearn.Core.Interfaces.YtDlp;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace EssLearn.Api.Services;

public class DownloadJobProcessor : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DownloadJobProcessor> _logger;
    private readonly TimeSpan _pollInterval = TimeSpan.FromSeconds(2);

    public DownloadJobProcessor(IServiceProvider serviceProvider, ILogger<DownloadJobProcessor> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("DownloadJobProcessor started.");

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
                _logger.LogError(ex, "Error in DownloadJobProcessor loop.");
            }

            await Task.Delay(_pollInterval, stoppingToken);
        }

        _logger.LogInformation("DownloadJobProcessor stopped.");
    }

    private async Task ProcessPendingJobsAsync(CancellationToken ct)
    {
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var ytdlpService = scope.ServiceProvider.GetRequiredService<IYtDlpService>();
        var blobStorage = scope.ServiceProvider.GetRequiredService<IBlobStorageService>();
        var blobOptions = scope.ServiceProvider.GetRequiredService<BlobStorageOptions>();

        var pendingJob = await dbContext.DownloadJobs
            .Include(j => j.Video).ThenInclude(v => v.Playlist)
            .Where(j => j.Status == DownloadJobStatus.Pending)
            .OrderBy(j => j.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (pendingJob == null)
            return;

        _logger.LogInformation("Processing download job {JobId} for video {VideoId}", pendingJob.Id, pendingJob.VideoId);

        pendingJob.Status = DownloadJobStatus.Downloading;
        pendingJob.UpdatedAt = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(ct);

        try
        {
            // Step 1: Download via yt-dlp with progress reporting
            var progress = new Progress<DownloadProgressDto>(p =>
            {
                pendingJob.ProgressPercent = p.PercentComplete;
                pendingJob.UpdatedAt = DateTime.UtcNow;
            });

            var request = new DownloadRequestDto
            {
                Url = $"https://www.youtube.com/watch?v={pendingJob.YoutubeVideoId}",
                Format = pendingJob.FormatId,
                OutputTemplate = Path.Combine(pendingJob.YoutubeVideoId, $"{pendingJob.Quality}.%(ext)s")
            };

            var outputPath = await ytdlpService.DownloadAsync(request, progress, ct);

            // Find the actual downloaded file
            var downloadDir = Path.GetDirectoryName(outputPath);
            if (downloadDir == null || !Directory.Exists(downloadDir))
                throw new InvalidOperationException("Download directory not found after download.");

            var downloadedFiles = Directory.GetFiles(downloadDir, $"{pendingJob.Quality}.*");
            if (downloadedFiles.Length == 0)
                throw new InvalidOperationException("Downloaded file not found.");

            var filePath = downloadedFiles[0];
            pendingJob.OutputPath = filePath;

            // Step 2: Upload to MinIO
            pendingJob.Status = DownloadJobStatus.Uploading;
            pendingJob.ProgressPercent = 95;
            pendingJob.UpdatedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync(ct);

            var fileBytes = await System.IO.File.ReadAllBytesAsync(filePath);
            var extension = Path.GetExtension(filePath).TrimStart('.');
            var video = pendingJob.Video;
            var blobPath = BlobPathBuilder.VideoPath(
                video.Playlist.FieldId,
                video.PlaylistId,
                video.Id,
                extension);

            using var fileStream = new MemoryStream(fileBytes);
            var uploadResult = await blobStorage.UploadFileAsync(
                blobOptions.Buckets.Videos,
                blobPath,
                fileStream,
                fileBytes.Length,
                "video/mp4");

            if (!uploadResult.Success)
                throw new InvalidOperationException($"Blob upload failed: {uploadResult.ErrorMessage}");

            // Step 3: Save DownloadedVideo record
            var downloadedVideo = new DownloadedVideo
            {
                PublicVideoId = video.Id,
                Quality = pendingJob.Quality,
                FormatId = pendingJob.FormatId,
                FileSizeBytes = fileBytes.Length,
                Container = extension,
                BlobPath = uploadResult.BlobPath,
                BlobBucket = blobOptions.Buckets.Videos,
                Sha256Hash = uploadResult.Sha256Hash,
                BlobStoredAt = DateTime.UtcNow,
                DownloadedAt = DateTime.UtcNow
            };

            dbContext.DownloadedVideos.Add(downloadedVideo);

            var integrity = new StorageIntegrity
            {
                BlobPath = uploadResult.BlobPath!,
                BlobBucket = blobOptions.Buckets.Videos,
                Sha256Hash = uploadResult.Sha256Hash!,
                ExpectedSize = fileBytes.Length,
                ActualSize = uploadResult.FileSizeBytes,
                IsValid = true,
                CheckedAt = DateTime.UtcNow
            };

            dbContext.StorageIntegrities.Add(integrity);

            // Step 4: Save downloaded video first to get the real generated ID
            await dbContext.SaveChangesAsync(ct);

            // Step 5: Mark job as completed
            pendingJob.Status = DownloadJobStatus.Completed;
            pendingJob.ProgressPercent = 100;
            pendingJob.CompletedAt = DateTime.UtcNow;
            pendingJob.UpdatedAt = DateTime.UtcNow;

            // Step 6: Create transcode job to convert to HLS
            var transcodeJob = new TranscodeJob
            {
                VideoId = video.Id,
                DownloadedVideoId = downloadedVideo.Id,
                Status = TranscodeJobStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };
            dbContext.TranscodeJobs.Add(transcodeJob);

            await dbContext.SaveChangesAsync(ct);

            _logger.LogInformation("Download job {JobId} completed. Stored at {BlobPath}. Transcode job {TranscodeJobId} created.",
                pendingJob.Id, uploadResult.BlobPath, transcodeJob.Id);

            // Clean up temp file
            CleanupTempFile(filePath);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Download job {JobId} failed.", pendingJob.Id);
            pendingJob.Status = DownloadJobStatus.Failed;
            pendingJob.ErrorMessage = ex.Message;
            pendingJob.UpdatedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync(ct);
        }
    }

    private void CleanupTempFile(string filePath)
    {
        try
        {
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
                var directory = Path.GetDirectoryName(filePath);
                if (directory != null && Directory.Exists(directory) && !Directory.EnumerateFileSystemEntries(directory).Any())
                    Directory.Delete(directory);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to clean up temp file: {FilePath}", filePath);
        }
    }
}
