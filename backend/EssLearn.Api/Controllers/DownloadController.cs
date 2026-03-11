using EssLearn.Api.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/videos/{videoId}/[controller]")]
public class DownloadController(
    AppDbContext db,
    IVideoDownloadService downloadService,
    IDistributedCache cache) : ControllerBase
{
    private const int CACHE_EXPIRATION_HOURS = 24;

    [HttpGet("formats")]
    public async Task<ActionResult<List<VideoFormatDto>>> GetFormats(int videoId)
    {
        var video = await db.Videos.FindAsync(videoId);
        if (video?.YoutubeVideoId == null)
            return NotFound();

        // Check cache first
        var cacheKey = $"formats:{video.YoutubeVideoId}";
        var cachedFormats = await cache.GetStringAsync(cacheKey);
        
        if (cachedFormats != null)
        {
            Console.WriteLine($"[DownloadController] Returning cached formats for {video.YoutubeVideoId}");
            var formats = JsonSerializer.Deserialize<List<VideoFormatDto>>(cachedFormats);
            return formats ?? new List<VideoFormatDto>();
        }

        Console.WriteLine($"[DownloadController] Fetching formats for {video.YoutubeVideoId}");
        var formatInfos = await downloadService.GetAvailableFormatsAsync(video.YoutubeVideoId);
        
        var formatDtos = formatInfos.Select(f => new VideoFormatDto(
            f.FormatId,
            f.Quality,
            f.Container,
            f.FileSizeBytes,
            FormatFileSize(f.FileSizeBytes),
            f.Width,
            f.Height,
            f.VideoCodec,
            f.AudioCodec
        )).ToList();

        // Cache for 24 hours
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(CACHE_EXPIRATION_HOURS)
        };
        await cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(formatDtos), cacheOptions);

        return formatDtos;
    }

    [HttpPost]
    public async Task<ActionResult<DownloadedVideoDto>> DownloadVideo(int videoId, [FromBody] DownloadVideoDto dto)
    {
        var video = await db.Videos
            .Include(v => v.DownloadedVideo)
            .FirstOrDefaultAsync(v => v.Id == videoId);
            
        if (video?.YoutubeVideoId == null)
            return NotFound();

        // Check if already downloaded
        if (video.DownloadedVideo != null)
            return Conflict(new { message = "Video already downloaded" });

        Console.WriteLine($"[DownloadController] Starting download for video {videoId}, format {dto.FormatId}");
        
        var result = await downloadService.DownloadVideoAsync(video.YoutubeVideoId, dto.FormatId, dto.Quality);
        
        if (!result.Success)
            return BadRequest(new { message = result.ErrorMessage });

        // Save to database
        var downloadedVideo = new DownloadedVideo
        {
            VideoId = videoId,
            FilePath = result.FilePath!,
            Quality = dto.Quality,
            FormatId = dto.FormatId,
            FileSizeBytes = result.FileSizeBytes,
            Container = Path.GetExtension(result.FilePath).TrimStart('.'),
            DownloadedAt = DateTime.UtcNow
        };

        db.DownloadedVideos.Add(downloadedVideo);
        await db.SaveChangesAsync();

        Console.WriteLine($"[DownloadController] Download complete for video {videoId}");

        return new DownloadedVideoDto(
            downloadedVideo.Id,
            downloadedVideo.Quality,
            downloadedVideo.Container,
            downloadedVideo.FileSizeBytes,
            downloadedVideo.Width,
            downloadedVideo.Height,
            downloadedVideo.DownloadedAt
        );
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteDownload(int videoId)
    {
        var downloadedVideo = await db.DownloadedVideos.FirstOrDefaultAsync(dv => dv.VideoId == videoId);
        if (downloadedVideo == null)
            return NotFound();

        // Delete file from disk
        if (System.IO.File.Exists(downloadedVideo.FilePath))
        {
            System.IO.File.Delete(downloadedVideo.FilePath);
            
            // Try to delete empty directory
            var directory = Path.GetDirectoryName(downloadedVideo.FilePath);
            if (directory != null && Directory.Exists(directory) && !Directory.EnumerateFileSystemEntries(directory).Any())
                Directory.Delete(directory);
        }

        db.DownloadedVideos.Remove(downloadedVideo);
        await db.SaveChangesAsync();

        Console.WriteLine($"[DownloadController] Deleted download for video {videoId}");
        return NoContent();
    }

    [HttpGet("status")]
    public async Task<ActionResult<object>> GetDownloadStatus(int videoId)
    {
        var downloadedVideo = await db.DownloadedVideos.FirstOrDefaultAsync(dv => dv.VideoId == videoId);
        
        return new
        {
            isDownloaded = downloadedVideo != null,
            download = downloadedVideo != null ? new DownloadedVideoDto(
                downloadedVideo.Id,
                downloadedVideo.Quality,
                downloadedVideo.Container,
                downloadedVideo.FileSizeBytes,
                downloadedVideo.Width,
                downloadedVideo.Height,
                downloadedVideo.DownloadedAt
            ) : null
        };
    }

    private static string FormatFileSize(long bytes)
    {
        if (bytes == 0) return "Unknown";
        
        string[] sizes = { "B", "KB", "MB", "GB" };
        int order = 0;
        double size = bytes;
        
        while (size >= 1024 && order < sizes.Length - 1)
        {
            order++;
            size /= 1024;
        }
        
        return $"{size:0.##} {sizes[order]}";
    }
}
