using EssLearn.Api.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Enums;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Infrastructure.Services;

/// <summary>
/// Service for managing videos and their progress.
/// </summary>
public class VideoService : IVideoService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _dbContext;

    public VideoService(IUnitOfWork unitOfWork, AppDbContext dbContext)
    {
        _unitOfWork = unitOfWork;
        _dbContext = dbContext;
    }

    public async Task<List<VideoListItemDto>> GetAllAsync(int? playlistId = null, int? fieldId = null)
    {
        var query = _dbContext.Videos
            .Include(v => v.Progress)
            .Include(v => v.DownloadedVideo)
            .Include(v => v.Playlist).ThenInclude(p => p.Channel)
            .AsQueryable();

        if (playlistId.HasValue)
            query = query.Where(v => v.PlaylistId == playlistId.Value);

        if (fieldId.HasValue)
            query = query.Where(v => v.Playlist.FieldId == fieldId.Value);

        var videos = await query
            .OrderByDescending(v => v.PublishedAt ?? v.CreatedAt)
            .ThenBy(v => v.Position)
            .ToListAsync();

        return videos.Select(v => new VideoListItemDto(
            v.Id,
            v.PlaylistId,
            v.Playlist.FieldId,
            v.Title,
            v.ThumbnailUrl,
            v.Url,
            v.DurationSeconds,
            v.Position,
            v.Progress?.Status ?? VideoStatus.NotStarted,
            v.Progress?.WatchedSeconds ?? 0,
            v.Playlist.Title,
            v.Playlist.Channel?.Title,
            v.DownloadedVideo is not null,
            v.PublishedAt,
            v.CreatedAt
        )).ToList();
    }

    public async Task<VideoDto?> GetByIdAsync(int id)
    {
        var v = await _dbContext.Videos
            .Include(v => v.Progress)
            .Include(v => v.DownloadedVideo)
            .FirstOrDefaultAsync(v => v.Id == id);

        return v is null ? null : MapVideo(v);
    }

    public async Task<ProgressDto?> UpdateProgressAsync(int id, UpdateProgressDto dto)
    {
        var video = await _dbContext.Videos.Include(v => v.Progress).FirstOrDefaultAsync(v => v.Id == id);
        if (video is null)
            return null;

        var progress = video.Progress;
        if (progress is null)
        {
            progress = new VideoProgress { VideoId = id };
            await _unitOfWork.VideoProgresses.AddAsync(progress);
            video.Progress = progress;
        }

        progress.WatchedSeconds = dto.WatchedSeconds;
        progress.Status = dto.Status;
        progress.LastWatchedAt = DateTime.UtcNow;
        progress.UpdatedAt = DateTime.UtcNow;

        if (dto.Status == VideoStatus.Completed && progress.CompletedAt is null)
        {
            progress.CompletedAt = DateTime.UtcNow;
        }

        await _unitOfWork.VideoProgresses.UpdateAsync(progress);
        await _unitOfWork.SaveChangesAsync();

        return new ProgressDto(id, progress.Status, progress.WatchedSeconds, progress.LastWatchedAt, progress.CompletedAt);
    }

    public async Task<ProgressDto> GetProgressAsync(int id)
    {
        var progress = await _dbContext.VideoProgresses.FirstOrDefaultAsync(p => p.VideoId == id);
        if (progress is null)
            return new ProgressDto(id, VideoStatus.NotStarted, 0, null, null);

        return new ProgressDto(id, progress.Status, progress.WatchedSeconds, progress.LastWatchedAt, progress.CompletedAt);
    }

    private static VideoDto MapVideo(Video v) => new(
        v.Id, v.PlaylistId, v.YoutubeVideoId, v.Title, v.ThumbnailUrl, v.Url,
        v.DurationSeconds, v.Position,
        v.Progress?.Status ?? VideoStatus.NotStarted,
        v.Progress?.WatchedSeconds ?? 0
    );
}
