using System.Diagnostics;
using System.Text.Json;
using EssLearn.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EssLearn.Infrastructure.Services;

public class VideoDownloadService : IVideoDownloadService
{
    private readonly string _downloadPath;
    private readonly ILogger<VideoDownloadService> _logger;

    public VideoDownloadService(IConfiguration configuration, ILogger<VideoDownloadService> logger)
    {
        _downloadPath = configuration["VideoStorage:DownloadPath"] ?? "/app/downloads";
        _logger = logger;
        
        // Ensure download directory exists
        Directory.CreateDirectory(_downloadPath);
    }

    public async Task<List<VideoFormatInfo>> GetAvailableFormatsAsync(string youtubeVideoId)
    {
        try
        {
            var url = $"https://www.youtube.com/watch?v={youtubeVideoId}";
            var startInfo = new ProcessStartInfo
            {
                FileName = "yt-dlp",
                Arguments = $"--dump-json \"{url}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            using var process = Process.Start(startInfo);
            if (process == null)
                throw new Exception("Failed to start yt-dlp process");

            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                _logger.LogError("yt-dlp failed: {Error}", error);
                return new List<VideoFormatInfo>();
            }

            var videoInfo = JsonSerializer.Deserialize<JsonElement>(output);
            var formats = videoInfo.GetProperty("formats");
            
            var formatList = new List<VideoFormatInfo>();
            
            foreach (var format in formats.EnumerateArray())
            {
                var formatId = format.GetProperty("format_id").GetString() ?? "";
                var ext = format.GetProperty("ext").GetString() ?? "mp4";
                
                // Get dimensions
                int? width = format.TryGetProperty("width", out var w) ? w.GetInt32() : null;
                int? height = format.TryGetProperty("height", out var h) ? h.GetInt32() : null;
                
                // Get file size (estimate if not available)
                long fileSize = 0;
                if (format.TryGetProperty("filesize", out var fs) && fs.ValueKind != JsonValueKind.Null)
                    fileSize = fs.GetInt64();
                else if (format.TryGetProperty("filesize_approx", out var fsa) && fsa.ValueKind != JsonValueKind.Null)
                    fileSize = fsa.GetInt64();
                
                // Get codecs
                string? vcodec = format.TryGetProperty("vcodec", out var vc) ? vc.GetString() : null;
                string? acodec = format.TryGetProperty("acodec", out var ac) ? ac.GetString() : null;
                
                bool hasVideo = vcodec != null && vcodec != "none";
                bool hasAudio = acodec != null && acodec != "none";
                
                // Build quality string
                string quality = height.HasValue ? $"{height}p" : (hasAudio && !hasVideo ? "audio" : "unknown");
                
                formatList.Add(new VideoFormatInfo(
                    formatId,
                    quality,
                    ext,
                    fileSize,
                    width,
                    height,
                    vcodec,
                    acodec,
                    hasVideo,
                    hasAudio
                ));
            }
            
            // Filter to good formats (video+audio combined or best separate streams)
            var goodFormats = formatList
                .Where(f => f.HasVideo && f.HasAudio) // Combined formats preferred
                .OrderByDescending(f => f.Height ?? 0)
                .Take(10)
                .ToList();
            
            return goodFormats;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting formats for video {VideoId}", youtubeVideoId);
            return new List<VideoFormatInfo>();
        }
    }

    public async Task<DownloadResult> DownloadVideoAsync(string youtubeVideoId, string formatId, string quality)
    {
        try
        {
            var outputDir = Path.Combine(_downloadPath, youtubeVideoId);
            Directory.CreateDirectory(outputDir);
            
            var outputTemplate = Path.Combine(outputDir, $"{quality}.%(ext)s");
            var url = $"https://www.youtube.com/watch?v={youtubeVideoId}";
            
            var startInfo = new ProcessStartInfo
            {
                FileName = "yt-dlp",
                Arguments = $"-f {formatId} -o \"{outputTemplate}\" \"{url}\"",
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            _logger.LogInformation("Downloading video {VideoId} with format {FormatId}", youtubeVideoId, formatId);
            
            using var process = Process.Start(startInfo);
            if (process == null)
                return new DownloadResult(false, null, 0, "Failed to start yt-dlp process");

            var output = await process.StandardOutput.ReadToEndAsync();
            var error = await process.StandardError.ReadToEndAsync();
            await process.WaitForExitAsync();

            if (process.ExitCode != 0)
            {
                _logger.LogError("Download failed: {Error}", error);
                return new DownloadResult(false, null, 0, error);
            }

            // Find the downloaded file
            var files = Directory.GetFiles(outputDir, $"{quality}.*");
            if (files.Length == 0)
                return new DownloadResult(false, null, 0, "Download succeeded but file not found");

            var filePath = files[0];
            var fileInfo = new FileInfo(filePath);
            
            _logger.LogInformation("Successfully downloaded video to {FilePath}", filePath);
            
            return new DownloadResult(true, filePath, fileInfo.Length, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading video {VideoId}", youtubeVideoId);
            return new DownloadResult(false, null, 0, ex.Message);
        }
    }

    public string GetVideoPath(int videoId, string quality)
    {
        // This will be implemented to retrieve from database
        return Path.Combine(_downloadPath, videoId.ToString(), $"{quality}.mp4");
    }

    public bool IsVideoDownloaded(int videoId)
    {
        var videoDir = Path.Combine(_downloadPath, videoId.ToString());
        return Directory.Exists(videoDir) && Directory.GetFiles(videoDir).Length > 0;
    }
}
