using EssLearn.Application.Dtos;
using EssLearn.Application.Mappings;
using EssLearn.Core.Entities;
using EssLearn.Core.Enums;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Infrastructure.Services;

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
        return playlists.Select(p => p.ToDto()).ToList();
    }

    public async Task<PlaylistDetailDto?> GetByIdAsync(int id)
    {
        var playlist = await _dbContext.Playlists
            .Include(p => p.Videos.OrderBy(v => v.Position)).ThenInclude(v => v.Progress)
            .Include(p => p.Videos).ThenInclude(v => v.DownloadedVideo)
            .Include(p => p.Channel)
            .FirstOrDefaultAsync(p => p.Id == id);

        return playlist?.ToDetailDto();
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

    public async Task<PaginatedVideosDto> GetVideosAsync(int playlistId, int page = 1, int pageSize = 10)
    {
        var query = _dbContext.Videos
            .Include(v => v.Progress)
            .Include(v => v.DownloadedVideo)
            .Include(v => v.Playlist).ThenInclude(p => p.Channel)
            .Where(v => v.PlaylistId == playlistId)
            .OrderBy(v => v.Position);

        var totalCount = await query.CountAsync();
        var videos = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var items = videos.Select(v => v.ToListItemDto()).ToList();

        return new PaginatedVideosDto(items, totalCount, page, pageSize, page * pageSize < totalCount);
    }
}
