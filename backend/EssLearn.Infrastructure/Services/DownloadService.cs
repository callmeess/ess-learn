using EssLearn.Api.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace EssLearn.Infrastructure.Services;

/// <summary>
/// Service for managing video downloads.
/// </summary>
public class DownloadService : IDownloadService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IVideoDownloadService _downloadService;
    private readonly IDistributedCache _cache;
    private readonly AppDbContext _dbContext;
    private const int CACHE_EXPIRATION_HOURS = 24;

    public DownloadService(
        IUnitOfWork unitOfWork,
        IVideoDownloadService downloadService,
        IDistributedCache cache,
        AppDbContext dbContext)
    {
        _unitOfWork = unitOfWork;
        _downloadService = downloadService;
        _cache = cache;
        _dbContext = dbContext;
    }

    public async Task<List<VideoFormatDto>> GetFormatsAsync(int videoId)
    {
        var video = await _unitOfWork.Videos.GetByIdAsync(videoId);
        if (video?.YoutubeVideoId == null)
            throw new InvalidOperationException("Video not found or has no YouTube ID.");

        // Check cache first
        var cacheKey = $"formats:{video.YoutubeVideoId}";
        var cachedFormats = await _cache.GetStringAsync(cacheKey);

        if (cachedFormats != null)
        {
            var formats = JsonSerializer.Deserialize<List<VideoFormatDto>>(cachedFormats);
            return formats ?? new List<VideoFormatDto>();
        }

        // Fetch formats from yt-dlp
        var formatInfos = await _downloadService.GetAvailableFormatsAsync(video.YoutubeVideoId);

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
        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(formatDtos), cacheOptions);

        return formatDtos;
    }

    public async Task<DownloadedVideoDto> DownloadVideoAsync(int videoId, DownloadVideoDto dto)
    {
        var video = await _unitOfWork.Videos.GetByIdAsync(videoId);
        if (video?.YoutubeVideoId == null)
            throw new InvalidOperationException("Video not found or has no YouTube ID.");

        // Check if already downloaded
        var existingDownload = await _dbContext.DownloadedVideos
            .FirstOrDefaultAsync(dv => dv.VideoId == videoId);
        if (existingDownload != null)
            throw new InvalidOperationException("Video is already downloaded.");

        // Download the video
        var result = await _downloadService.DownloadVideoAsync(video.YoutubeVideoId, dto.FormatId, dto.Quality);

        if (!result.Success)
            throw new InvalidOperationException($"Download failed: {result.ErrorMessage}");

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

        await _unitOfWork.DownloadedVideos.AddAsync(downloadedVideo);
        await _unitOfWork.SaveChangesAsync();

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

    public async Task DeleteDownloadAsync(int videoId)
    {
        var downloadedVideo = await _dbContext.DownloadedVideos
            .FirstOrDefaultAsync(dv => dv.VideoId == videoId);
        if (downloadedVideo == null)
            throw new InvalidOperationException("Download not found.");

        // Delete file from disk
        if (System.IO.File.Exists(downloadedVideo.FilePath))
        {
            System.IO.File.Delete(downloadedVideo.FilePath);

            // Try to delete empty directory
            var directory = Path.GetDirectoryName(downloadedVideo.FilePath);
            if (directory != null && Directory.Exists(directory) && !Directory.EnumerateFileSystemEntries(directory).Any())
                Directory.Delete(directory);
        }

        await _unitOfWork.DownloadedVideos.RemoveAsync(downloadedVideo);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<object> GetDownloadStatusAsync(int videoId)
    {
        var downloadedVideo = await _dbContext.DownloadedVideos
            .FirstOrDefaultAsync(dv => dv.VideoId == videoId);

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

        return $"{Math.Round(size, 2)} {sizes[order]}";
    }
}
