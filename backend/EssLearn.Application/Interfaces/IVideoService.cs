using EssLearn.Application.Dtos;

namespace EssLearn.Application.Interfaces;


public interface IVideoService
{
    Task<List<VideoListItemDto>> GetAllAsync(int? playlistId = null, int? fieldId = null);
    Task<VideoDto?> GetByIdAsync(int id);
    Task<ProgressDto?> UpdateProgressAsync(int id, UpdateProgressDto dto);
    Task<ProgressDto> GetProgressAsync(int id);
}
