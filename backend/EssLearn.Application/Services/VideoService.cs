using EssLearn.Application.Dtos;
using EssLearn.Application.Mappings;
using EssLearn.Core.Entities;
using EssLearn.Core.Enums;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Infrastructure.Services;

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
            .Include(v => v.TranscodedVideos)
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

        return videos.Select(v => v.ToListItemDto()).ToList();
    }

    public async Task<VideoDto?> GetByIdAsync(int id)
    {
        var v = await _dbContext.Videos
            .Include(v => v.Progress)
            .Include(v => v.DownloadedVideo)
            .Include(v => v.TranscodedVideos)
            .FirstOrDefaultAsync(v => v.Id == id);

        return v?.ToDto();
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

        return progress.ToDto();
    }

    public async Task<ProgressDto> GetProgressAsync(int id)
    {
        var progress = await _dbContext.VideoProgresses.FirstOrDefaultAsync(p => p.VideoId == id);
        if (progress is null)
            return new ProgressDto(id, VideoStatus.NotStarted, 0, null, null);

        return progress.ToDto();
    }
}
