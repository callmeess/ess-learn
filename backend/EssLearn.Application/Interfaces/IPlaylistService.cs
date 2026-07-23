using EssLearn.Application.Dtos;
namespace EssLearn.Core.Interfaces;


public interface IPlaylistService
{
    Task<List<PlaylistDto>> GetAllAsync(int? fieldId = null);
    Task<PlaylistDetailDto?> GetByIdAsync(int id);
    Task<PaginatedVideosDto> GetVideosAsync(int playlistId, int page = 1, int pageSize = 10);
    Task DeleteAsync(int id);
}
