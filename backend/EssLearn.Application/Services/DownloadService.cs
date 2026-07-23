using EssLearn.Application.Dtos;
using EssLearn.Application.Dtos.BlobStorage;
using EssLearn.Application.Mappings;
using EssLearn.Application.Services.BlobStorage;
using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
using EssLearn.Core.Interfaces.YtDlp;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using System.Text.Json;

namespace EssLearn.Infrastructure.Services;

/// <summary>
/// Service for managing video downloads.
/// Orchestrates downloading from YouTube, uploading to MinIO, and database operations.
/// </summary>
public class DownloadService : IDownloadService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IYtDlpService _ytdlpService;
    private readonly IBlobStorageService _blobStorage;
    private readonly IDistributedCache _cache;
    private readonly AppDbContext _dbContext;
    private readonly BlobStorageOptions _blobOptions;
    private readonly ILogger<DownloadService> _logger;
    private const int CACHE_EXPIRATION_HOURS = 24;

    public DownloadService(
        IUnitOfWork unitOfWork,
        IYtDlpService ytdlpService,
        IBlobStorageService blobStorage,
        IDistributedCache cache,
        AppDbContext dbContext,
        BlobStorageOptions blobOptions,
        ILogger<DownloadService> logger)
    {
        _unitOfWork = unitOfWork;
        _ytdlpService = ytdlpService;
        _blobStorage = blobStorage;
        _cache = cache;
        _dbContext = dbContext;
        _blobOptions = blobOptions;
        _logger = logger;
    }

    public async Task<List<VideoFormatDto>> GetFormatsAsync(int videoId)
    {
        var video = await _dbContext.Videos
            .Include(v => v.Playlist)
            .FirstOrDefaultAsync(v => v.Id == videoId);
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
        var formatInfos = await _ytdlpService.GetAvailableFormatsAsync(video.YoutubeVideoId);

        var formatDtos = formatInfos.Select(f => f.ToDto()).ToList();

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
        var video = await _dbContext.Videos
            .Include(v => v.Playlist)
            .FirstOrDefaultAsync(v => v.Id == videoId);
        if (video?.YoutubeVideoId == null)
            throw new InvalidOperationException("Video not found or has no YouTube ID.");

        // Check if already downloaded
        var existingDownload = await _dbContext.DownloadedVideos
        .FirstOrDefaultAsync(dv => dv.PublicVideoId == videoId);
        if (existingDownload != null)
            throw new InvalidOperationException("Video is already downloaded.");

        // Check if there's already a pending/active job
        var existingJob = await _dbContext.DownloadJobs
            .FirstOrDefaultAsync(j => j.VideoId == videoId &&
                (j.Status == DownloadJobStatus.Pending ||
                 j.Status == DownloadJobStatus.Downloading ||
                 j.Status == DownloadJobStatus.Uploading));
        if (existingJob != null)
            throw new InvalidOperationException("A download is already in progress for this video.");

        // Create a download job
        var job = new DownloadJob
        {
            VideoId = videoId,
            YoutubeVideoId = video.YoutubeVideoId,
            FormatId = dto.FormatId,
            Quality = dto.Quality,
            Status = DownloadJobStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.DownloadJobs.Add(job);
        await _dbContext.SaveChangesAsync();

        _logger.LogInformation("Created download job {JobId} for video {VideoId}", job.Id, videoId);

        return new DownloadedVideoDto(
            job.Id,
            dto.Quality,
            string.Empty,
            0,
            null,
            null,
            DateTime.UtcNow
        );
    }

    public async Task DeleteDownloadAsync(int videoId)
    {
        var downloadedVideo = await _dbContext.DownloadedVideos
            .FirstOrDefaultAsync(dv => dv.PublicVideoId == videoId);
        if (downloadedVideo == null)
            throw new InvalidOperationException("Download not found.");

        try
        {
            // Delete from MinIO
            if (downloadedVideo.BlobPath != null)
            {
                var deleteResult = await _blobStorage.DeleteBlobAsync(
                    downloadedVideo.BlobBucket,
                    downloadedVideo.BlobPath);

                if (!deleteResult.Success)
                {
                    _logger.LogWarning("Failed to delete blob {BlobPath}: {Error}",
                        downloadedVideo.BlobPath, deleteResult.ErrorMessage);
                }
            }

            // Delete from database
            await _unitOfWork.DownloadedVideos.RemoveAsync(downloadedVideo);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Video download {VideoId} deleted from blob storage and database", videoId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting download {VideoId}", videoId);
            throw;
        }
    }

    public async Task<DownloadStatusResponseDto> GetDownloadStatusAsync(int videoId)
    {
        var downloadedVideo = await _dbContext.DownloadedVideos
            .FirstOrDefaultAsync(dv => dv.PublicVideoId == videoId);

        return new DownloadStatusResponseDto(
            downloadedVideo is not null,
            downloadedVideo?.ToDto()
        );
    }

    public async Task<DownloadProgressResponseDto> GetDownloadProgressAsync(int videoId)
    {
        var job = await _dbContext.DownloadJobs
            .Where(j => j.VideoId == videoId)
            .OrderByDescending(j => j.CreatedAt)
            .FirstOrDefaultAsync();

        return job.ToProgressResponseDto();
    }
}
