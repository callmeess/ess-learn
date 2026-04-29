using EssLearn.Application.Dtos;

namespace EssLearn.Core.Interfaces;

public interface IRoadmapService
{
    Task<List<RoadmapDto>> GetAllAsync();
    Task<RoadmapDetailDto?> GetByIdAsync(int id);
    Task<RoadmapDto> CreateAsync(CreateRoadmapDto dto);
    Task<RoadmapDto?> UpdateAsync(int id, UpdateRoadmapDto dto);
    Task DeleteAsync(int id);
    Task<RoadmapNodeDto> AddPlaylistAsync(int roadmapId, AddPlaylistToRoadmapDto dto);
    Task<RoadmapNodeDto?> UpdateNodeAsync(int nodeId, UpdateRoadmapNodeDto dto);
    Task RemoveNodeAsync(int nodeId);
}
