using EssLearn.Application.Dtos;
namespace EssLearn.Core.Interfaces;


public interface IPlaylistService
{
    Task<List<PlaylistDto>> GetAllAsync(int? fieldId = null);
    Task<PlaylistDetailDto?> GetByIdAsync(int id);
    Task<PaginatedVideosDto> GetVideosAsync(int playlistId, int page = 1, int pageSize = 10);
    Task<PlaylistDto> CreateAsync(CreatePlaylistDto dto);
    Task<PlaylistDto?> UpdateAsync(int id, UpdatePlaylistDto dto);
    Task AddVideosAsync(int playlistId, AddVideosToPlaylistDto dto);
    Task<bool> RemoveVideoAsync(int playlistId, int videoId);
    Task DeleteAsync(int id);
}
