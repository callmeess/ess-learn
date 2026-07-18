using EssLearn.Application.Dtos;

namespace EssLearn.Core.Interfaces;

public interface IRoadmapService
{
    Task<List<RoadmapListItemDto>> GetAllAsync();
    Task<RoadmapDetailDto?> GetByIdAsync(int id);
    Task<RoadmapListItemDto> CreateAsync(CreateRoadmapDto dto);
    Task DeleteAsync(int id);
    Task<RoadmapNodeDto> AddNodeAsync(int roadmapId, CreateRoadmapNodeDto dto);
    Task<RoadmapNodeDto?> UpdateNodeStatusAsync(int roadmapId, int nodeId, UpdateNodeStatusDto dto);
    Task<RoadmapNodeDto?> UpdateNodeAsync(int roadmapId, int nodeId, UpdateRoadmapNodeDto dto);
    Task DeleteNodeAsync(int roadmapId, int nodeId);
}
