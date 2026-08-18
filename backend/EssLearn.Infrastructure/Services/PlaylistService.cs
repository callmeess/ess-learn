using EssLearn.Application.Dtos;
using EssLearn.Application.Interfaces;
using EssLearn.Application.Mappings;
using EssLearn.Core.Entities;
using EssLearn.Core.Enums;
using EssLearn.Infrastructure.Data;
using EssLearn.Infrastructure.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;

namespace EssLearn.Infrastructure.Services;

public class PlaylistService : IPlaylistService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _dbContext;
    private readonly IDistributedCache _cache;

    public PlaylistService(IUnitOfWork unitOfWork, AppDbContext dbContext, IDistributedCache cache)
    {
        _unitOfWork = unitOfWork;
        _dbContext = dbContext;
        _cache = cache;
    }

    public async Task<List<PlaylistDto>> GetAllAsync(int? fieldId = null)
    {
        var query = _dbContext.Playlists
            .Include(p => p.Videos).ThenInclude(v => v.Progress)
            .Include(p => p.Channel)
            .AsQueryable();

        if (fieldId.HasValue)
            query = query.Where(p => p.FieldId == fieldId.Value);

        var playlists = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        return playlists.Select(p => p.ToDto()).ToList();
    }

    public async Task<PlaylistDetailDto?> GetByIdAsync(int id)
    {
        var playlist = await _dbContext.Playlists
            .Include(p => p.Videos.OrderBy(v => v.Position)).ThenInclude(v => v.Progress)
            .Include(p => p.Videos).ThenInclude(v => v.DownloadedVideo)
            .Include(p => p.Videos).ThenInclude(v => v.TranscodedVideos)
            .Include(p => p.Channel)
            .FirstOrDefaultAsync(p => p.Id == id);

        return playlist?.ToDetailDto();
    }

    public async Task<PlaylistDto> CreateAsync(CreatePlaylistDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Title))
            throw new InvalidOperationException("Playlist title is required.");

        var field = await _unitOfWork.LearningFields.GetByIdAsync(dto.FieldId);
        if (field is null)
            throw new InvalidOperationException("Learning field not found.");

        var playlist = new Playlist
        {
            FieldId = dto.FieldId,
            Title = dto.Title.Trim(),
            Description = dto.Description,
            ThumbnailUrl = dto.ThumbnailUrl,
            SourceUrl = dto.SourceUrl,
            TotalVideos = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Playlists.AddAsync(playlist);
        await _unitOfWork.SaveChangesAsync();
        await InvalidateDashboardCacheAsync();

        return playlist.ToDto();
    }

    public async Task<PlaylistDto?> UpdateAsync(int id, UpdatePlaylistDto dto)
    {
        var playlist = await _unitOfWork.Playlists.GetByIdAsync(id);
        if (playlist is null) return null;

        if (dto.FieldId.HasValue && dto.FieldId.Value != playlist.FieldId)
        {
            var field = await _unitOfWork.LearningFields.GetByIdAsync(dto.FieldId.Value);
            if (field is null)
                throw new InvalidOperationException("Learning field not found.");
            playlist.FieldId = dto.FieldId.Value;
        }

        if (!string.IsNullOrWhiteSpace(dto.Title))
            playlist.Title = dto.Title.Trim();

        playlist.Description = dto.Description;
        playlist.ThumbnailUrl = dto.ThumbnailUrl;
        playlist.SourceUrl = dto.SourceUrl;
        playlist.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Playlists.UpdateAsync(playlist);
        await _unitOfWork.SaveChangesAsync();
        await InvalidateDashboardCacheAsync();

        var updated = await _dbContext.Playlists
            .Include(p => p.Videos).ThenInclude(v => v.Progress)
            .Include(p => p.Channel)
            .FirstOrDefaultAsync(p => p.Id == id);

        return updated?.ToDto();
    }

    public async Task AddVideosAsync(int playlistId, AddVideosToPlaylistDto dto)
    {
        var playlist = await _unitOfWork.Playlists.GetByIdAsync(playlistId);
        if (playlist is null)
            throw new InvalidOperationException("Playlist not found.");

        if (dto.VideoIds.Count == 0)
            return;

        var videos = new List<Video>();
        foreach (var videoId in dto.VideoIds)
        {
            var video = await _unitOfWork.Videos.GetByIdAsync(videoId);
            if (video is null)
                throw new InvalidOperationException($"Video {videoId} not found.");
            videos.Add(video);
        }

        var maxPosition = await _dbContext.Videos
            .Where(v => v.PlaylistId == playlistId)
            .MaxAsync(v => (int?)v.Position) ?? 0;

        foreach (var video in videos)
        {
            if (video.PlaylistId == playlistId)
                continue;

            maxPosition++;
            video.PlaylistId = playlistId;
            video.Position = maxPosition;
            video.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Videos.UpdateAsync(video);
        }

        await _unitOfWork.SaveChangesAsync();
        await InvalidateDashboardCacheAsync();
    }

    public async Task<bool> RemoveVideoAsync(int playlistId, int videoId)
    {
        var playlist = await _unitOfWork.Playlists.GetByIdAsync(playlistId);
        if (playlist is null) return false;

        var video = await _unitOfWork.Videos.GetByIdAsync(videoId);
        if (video is null || video.PlaylistId != playlistId)
            return false;

        if (string.Equals(playlist.Title, "Unsorted", StringComparison.OrdinalIgnoreCase))
            return true;

        var unsorted = await _dbContext.Playlists
            .FirstOrDefaultAsync(p => p.FieldId == playlist.FieldId && p.Title == "Unsorted");

        if (unsorted is null)
        {
            unsorted = new Playlist
            {
                FieldId = playlist.FieldId,
                Title = "Unsorted",
                TotalVideos = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Playlists.AddAsync(unsorted);
            await _unitOfWork.SaveChangesAsync();
        }

        var maxPosition = await _dbContext.Videos
            .Where(v => v.PlaylistId == unsorted.Id)
            .MaxAsync(v => (int?)v.Position) ?? 0;

        video.PlaylistId = unsorted.Id;
        video.Position = maxPosition + 1;
        video.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Videos.UpdateAsync(video);
        await _unitOfWork.SaveChangesAsync();
        await InvalidateDashboardCacheAsync();

        return true;
    }

    public async Task DeleteAsync(int id)
    {
        var playlist = await _unitOfWork.Playlists.GetByIdAsync(id);
        if (playlist != null)
        {
            await _unitOfWork.Playlists.RemoveAsync(playlist);
            await _unitOfWork.SaveChangesAsync();
            await InvalidateDashboardCacheAsync();
        }
    }

    public async Task<PaginatedVideosDto> GetVideosAsync(int playlistId, int page = 1, int pageSize = 10)
    {
        var query = _dbContext.Videos
            .Include(v => v.Progress)
            .Include(v => v.DownloadedVideo)
            .Include(v => v.TranscodedVideos)
            .Include(v => v.Playlist).ThenInclude(p => p.Channel)
            .Where(v => v.PlaylistId == playlistId)
            .OrderBy(v => v.Position);

        var totalCount = await query.CountAsync();
        var videos = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var items = videos.Select(v => v.ToListItemDto()).ToList();

        return new PaginatedVideosDto(items, totalCount, page, pageSize, page * pageSize < totalCount);
    }

    private async Task InvalidateDashboardCacheAsync()
    {
        foreach (var key in StatsCacheKeys.All())
        {
            await _cache.RemoveAsync(key);
        }
    }
}
