using EssLearn.Application.Dtos;
namespace EssLearn.Core.Interfaces;


public interface IPlaylistService
{
    Task<List<PlaylistDto>> GetAllAsync(int? fieldId = null);
    Task<PlaylistDetailDto?> GetByIdAsync(int id);
    Task DeleteAsync(int id);
}
