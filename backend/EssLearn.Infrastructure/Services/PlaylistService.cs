using EssLearn.Api.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Enums;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Infrastructure.Services;

/// <summary>
/// Service for managing playlists and their related data.
/// </summary>
public class PlaylistService : IPlaylistService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _dbContext;

    public PlaylistService(IUnitOfWork unitOfWork, AppDbContext dbContext)
    {
        _unitOfWork = unitOfWork;
        _dbContext = dbContext;
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
        return playlists.Select(MapPlaylist).ToList();
    }

    public async Task<PlaylistDetailDto?> GetByIdAsync(int id)
    {
        var playlist = await _dbContext.Playlists
            .Include(p => p.Videos.OrderBy(v => v.Position)).ThenInclude(v => v.Progress)
            .Include(p => p.Videos).ThenInclude(v => v.DownloadedVideo)
            .Include(p => p.Channel)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (playlist is null) return null;

        var videos = playlist.Videos.Select(v => new VideoDto(
            v.Id, v.PlaylistId, v.YoutubeVideoId, v.Title, v.ThumbnailUrl, v.Url,
            v.DurationSeconds, v.Position,
            v.Progress?.Status ?? VideoStatus.NotStarted,
            v.Progress?.WatchedSeconds ?? 0
        )).ToList();

        return new PlaylistDetailDto(MapPlaylist(playlist), videos);
    }

    public async Task DeleteAsync(int id)
    {
        var playlist = await _unitOfWork.Playlists.GetByIdAsync(id);
        if (playlist != null)
        {
            await _unitOfWork.Playlists.RemoveAsync(playlist);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    private static PlaylistDto MapPlaylist(Playlist p)
    {
        var videos = p.Videos.ToList();
        return new PlaylistDto(
            p.Id, p.FieldId, p.Title, p.Description, p.ThumbnailUrl, p.SourceUrl,
            videos.Count,
            videos.Count(v => v.Progress?.Status == VideoStatus.Completed),
            videos.Sum(v => v.DurationSeconds),
            videos.Sum(v => v.Progress?.WatchedSeconds ?? 0),
            p.Channel?.Title,
            p.CreatedAt
        );
    }
}
