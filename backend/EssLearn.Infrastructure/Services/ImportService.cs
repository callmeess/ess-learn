using EssLearn.Application.Dtos;
using EssLearn.Application.Dtos.BlobStorage;
using EssLearn.Application.Interfaces;
using EssLearn.Application.Interfaces.YtDlp;
using EssLearn.Core.Entities;
using EssLearn.Infrastructure.Data;
using EssLearn.Infrastructure.Interfaces;
using EssLearn.Infrastructure.Services.BlobStorage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace EssLearn.Infrastructure.Services;

public class ImportService : IImportService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _dbContext;
    private readonly IYtDlpService _ytdlpService;
    private readonly IBlobStorageService _blobStorage;
    private readonly BlobStorageOptions _blobOptions;
    private readonly ILogger<ImportService> _logger;
    private readonly IDistributedCache _cache;
    private static readonly HttpClient _thumbClient = new();

    public ImportService(
        IUnitOfWork unitOfWork,
        AppDbContext dbContext,
        IYtDlpService ytdlpService,
        IBlobStorageService blobStorage,
        BlobStorageOptions blobOptions,
        ILogger<ImportService> logger,
        IDistributedCache cache)
    {
        _unitOfWork = unitOfWork;
        _dbContext = dbContext;
        _ytdlpService = ytdlpService;
        _blobStorage = blobStorage;
        _blobOptions = blobOptions;
        _logger = logger;
        _cache = cache;
    }

    public async Task<ImportResultDto> ImportVideoAsync(ImportVideoDto dto)
    {
        var videoId = ExtractVideoId(dto.VideoUrl);
        if (videoId == null)
            throw new InvalidOperationException("Invalid YouTube video URL.");

        var existingVideo = await _dbContext.Videos
            .FirstOrDefaultAsync(v => v.YoutubeVideoId == videoId);
        if (existingVideo != null)
            throw new InvalidOperationException("This video has already been imported.");

        var field = await _unitOfWork.LearningFields.GetByIdAsync(dto.FieldId);
        if (field is null)
            throw new InvalidOperationException("Learning field not found.");

        var playlist = await ResolvePlaylistAsync(dto.PlaylistId, dto.FieldId);

        var metadata = await _ytdlpService.GetMetadataAsync($"https://www.youtube.com/watch?v={videoId}");

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            var position = await _dbContext.Videos
                .Where(v => v.PlaylistId == playlist.Id)
                .MaxAsync(v => (int?)v.Position) ?? 0;

            var newVideo = new Video
            {
                PlaylistId = playlist.Id,
                Title = metadata.Title,
                Description = metadata.Description,
                YoutubeVideoId = metadata.Id,
                ThumbnailUrl = metadata.Thumbnail,
                Url = metadata.WebpageUrl,
                DurationSeconds = (int)metadata.Duration,
                Position = position + 1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Videos.AddAsync(newVideo);
            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitAsync();
            await InvalidateDashboardCacheAsync();

            _ = UploadThumbnailAsync(newVideo, dto.FieldId, playlist.Id);

            return new ImportResultDto(playlist.Id, newVideo.Title, 1, playlist.Title);
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    public async Task<ImportResultDto> ImportPlaylistAsync(ImportPlaylistDto dto)
    {
        var playlistId = ExtractPlaylistId(dto.PlaylistUrl);
        if (playlistId == null)
            throw new InvalidOperationException("Invalid YouTube playlist URL.");

        var existingPlaylist = await _dbContext.Playlists
            .FirstOrDefaultAsync(p => p.YoutubePlaylistId == playlistId);
        if (existingPlaylist != null)
            throw new InvalidOperationException("This playlist has already been imported.");

        var field = await _unitOfWork.LearningFields.GetByIdAsync(dto.FieldId);
        if (field is null)
            throw new InvalidOperationException("Learning field not found.");

        var entries = await _ytdlpService.GetPlaylistEntriesAsync(dto.PlaylistUrl);
        if (entries.Count == 0)
            throw new InvalidOperationException("No videos found in the playlist.");

        var firstEntry = entries[0];

        await _unitOfWork.BeginTransactionAsync();
        try
        {
            Channel? channel = null;
            if (!string.IsNullOrEmpty(firstEntry.ChannelId))
            {
                channel = await _dbContext.Channels
                    .FirstOrDefaultAsync(c => c.YoutubeChannelId == firstEntry.ChannelId);

                if (channel is null)
                {
                    channel = new Channel
                    {
                        YoutubeChannelId = firstEntry.ChannelId,
                        Title = firstEntry.Uploader ?? "Unknown Channel",
                        ThumbnailUrl = firstEntry.Thumbnail,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.Channels.AddAsync(channel);
                }
                else
                {
                    channel.Title = firstEntry.Uploader ?? channel.Title;
                    channel.ThumbnailUrl = firstEntry.Thumbnail ?? channel.ThumbnailUrl;
                    channel.UpdatedAt = DateTime.UtcNow;
                    await _unitOfWork.Channels.UpdateAsync(channel);
                }
            }

            var newPlaylist = new Playlist
            {
                FieldId = dto.FieldId,
                ChannelId = channel?.Id,
                YoutubePlaylistId = playlistId,
                Title = firstEntry.PlaylistTitle ?? "Untitled Playlist",
                ThumbnailUrl = firstEntry.Thumbnail,
                SourceUrl = dto.PlaylistUrl,
                TotalVideos = entries.Count,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Playlists.AddAsync(newPlaylist);

            var videosToImport = new List<Video>();
            foreach (var entry in entries)
            {
                if (string.IsNullOrEmpty(entry.Id)) continue;

                var video = new Video
                {
                    Playlist = newPlaylist,
                    Title = entry.Title,
                    Description = entry.Description,
                    YoutubeVideoId = entry.Id,
                    ThumbnailUrl = entry.Thumbnail,
                    Url = $"https://www.youtube.com/watch?v={entry.Id}",
                    DurationSeconds = (int)entry.Duration,
                    Position = entry.PlaylistIndex ?? entries.IndexOf(entry) + 1,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                videosToImport.Add(video);
                await _unitOfWork.Videos.AddAsync(video);
            }

            await _unitOfWork.SaveChangesAsync();
            await _unitOfWork.CommitAsync();
            await InvalidateDashboardCacheAsync();

            foreach (var video in videosToImport)
            {
                _ = UploadThumbnailAsync(video, dto.FieldId, newPlaylist.Id);
            }

            return new ImportResultDto(newPlaylist.Id, newPlaylist.Title, entries.Count, channel?.Title);
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    private async Task UploadThumbnailAsync(Video video, int fieldId, int playlistId)
    {
        if (string.IsNullOrEmpty(video.ThumbnailUrl) || !video.ThumbnailUrl.StartsWith("http"))
            return;

        try
        {
            var imageBytes = await _thumbClient.GetByteArrayAsync(video.ThumbnailUrl);
            var blobPath = BlobPathBuilder.VideoThumbnailPath(fieldId, playlistId, video.Id);

            using var stream = new MemoryStream(imageBytes);
            var result = await _blobStorage.UploadFileAsync(
                _blobOptions.Buckets.Videos,
                blobPath,
                stream,
                imageBytes.Length,
                "image/jpeg");

            if (result.Success)
            {
                video.ThumbnailUrl = blobPath;
                video.UpdatedAt = DateTime.UtcNow;
                await _dbContext.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to upload thumbnail for video {VideoId}, keeping original URL", video.Id);
        }
    }

    private async Task<Playlist> ResolvePlaylistAsync(int? playlistId, int fieldId)
    {
        if (playlistId.HasValue)
        {
            var existing = await _unitOfWork.Playlists.GetByIdAsync(playlistId.Value);
            if (existing is null || existing.FieldId != fieldId)
                throw new InvalidOperationException("Playlist not found or does not belong to the specified field.");
            return existing;
        }

        var unsorted = await _dbContext.Playlists
            .FirstOrDefaultAsync(p => p.FieldId == fieldId && p.Title == "Unsorted");

        if (unsorted is not null)
            return unsorted;

        unsorted = new Playlist
        {
            FieldId = fieldId,
            Title = "Unsorted",
            TotalVideos = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Playlists.AddAsync(unsorted);
        await _unitOfWork.SaveChangesAsync();

        return unsorted;
    }

    private async Task InvalidateDashboardCacheAsync()
    {
        foreach (var key in StatsCacheKeys.All())
        {
            await _cache.RemoveAsync(key);
        }
    }

    private static string? ExtractVideoId(string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return null;

        var pattern = @"(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})";
        var match = System.Text.RegularExpressions.Regex.Match(url, pattern);
        return match.Success ? match.Groups[1].Value : null;
    }

    private static string? ExtractPlaylistId(string url)
    {
        var match = System.Text.RegularExpressions.Regex.Match(url, @"[?&]list=([a-zA-Z0-9_-]+)");
        return match.Success ? match.Groups[1].Value : null;
    }
}
