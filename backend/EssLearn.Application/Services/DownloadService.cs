using EssLearn.Application.Dtos;
using EssLearn.Application.Dtos.BlobStorage;
using EssLearn.Application.Services.BlobStorage;
using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
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
    private readonly IVideoDownloadService _downloadService;
    private readonly IBlobStorageService _blobStorage;
    private readonly IDistributedCache _cache;
    private readonly AppDbContext _dbContext;
    private readonly BlobStorageOptions _blobOptions;
    private readonly ILogger<DownloadService> _logger;
    private const int CACHE_EXPIRATION_HOURS = 24;

    public DownloadService(
        IUnitOfWork unitOfWork,
        IVideoDownloadService downloadService,
        IBlobStorageService blobStorage,
        IDistributedCache cache,
        AppDbContext dbContext,
        BlobStorageOptions blobOptions,
        ILogger<DownloadService> logger)
    {
        _unitOfWork = unitOfWork;
        _downloadService = downloadService;
        _blobStorage = blobStorage;
        _cache = cache;
        _dbContext = dbContext;
        _blobOptions = blobOptions;
        _logger = logger;
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

        try
        {
            // Read file bytes
            var fileBytes = await System.IO.File.ReadAllBytesAsync(result.FilePath!);

            // Generate blob path using hierarchy: videos/fields/{fieldId}/playlists/{playlistId}/{videoId}/video.ext
            var extension = Path.GetExtension(result.FilePath).TrimStart('.');
            var blobPath = BlobPathBuilder.VideoPath(
                video.Playlist.FieldId,
                video.PlaylistId,
                videoId,
                extension);

            // Upload to MinIO
            using var fileStream = new MemoryStream(fileBytes);
            var uploadResult = await _blobStorage.UploadFileAsync(
                _blobOptions.Buckets.Videos,
                blobPath,
                fileStream,
                fileBytes.Length,
                "video/mp4");

            if (!uploadResult.Success)
                throw new InvalidOperationException($"Blob upload failed: {uploadResult.ErrorMessage}");

            // Save to database in transaction
            var downloadedVideo = new DownloadedVideo
            {
                VideoId = videoId,
                Quality = dto.Quality,
                FormatId = dto.FormatId,
                FileSizeBytes = fileBytes.Length,
                Container = extension,
                BlobPath = uploadResult.BlobPath,
                BlobBucket = _blobOptions.Buckets.Videos,
                Sha256Hash = uploadResult.Sha256Hash,
                BlobStoredAt = DateTime.UtcNow,
                DownloadedAt = DateTime.UtcNow
            };

            await _unitOfWork.DownloadedVideos.AddAsync(downloadedVideo);

            // Create integrity record
            var integrity = new StorageIntegrity
            {
                BlobPath = uploadResult.BlobPath!,
                BlobBucket = _blobOptions.Buckets.Videos,
                Sha256Hash = uploadResult.Sha256Hash!,
                ExpectedSize = fileBytes.Length,
                ActualSize = uploadResult.FileSizeBytes,
                IsValid = true,
                CheckedAt = DateTime.UtcNow,
                DownloadedVideoId = downloadedVideo.Id
            };

            await _unitOfWork.StorageIntegrities.AddAsync(integrity);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Video {VideoId} downloaded and stored at {BlobPath}", videoId, uploadResult.BlobPath);

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
        finally
        {
            // Clean up local temp file
            if (result.FilePath != null && System.IO.File.Exists(result.FilePath))
            {
                try
                {
                    System.IO.File.Delete(result.FilePath);

                    var directory = Path.GetDirectoryName(result.FilePath);
                    if (directory != null && Directory.Exists(directory) && !Directory.EnumerateFileSystemEntries(directory).Any())
                        Directory.Delete(directory);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to clean up temp file: {FilePath}", result.FilePath);
                }
            }
        }
    }

    public async Task DeleteDownloadAsync(int videoId)
    {
        var downloadedVideo = await _dbContext.DownloadedVideos
            .FirstOrDefaultAsync(dv => dv.VideoId == videoId);
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
