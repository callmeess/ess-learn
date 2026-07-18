namespace EssLearn.Application.Dtos;

public record RoadmapListItemDto(
    int Id,
    string Name,
    string? Description,
    string Category,
    string Color,
    string? Icon,
    string[] Tags,
    int TotalNodes,
    int CompletedNodes,
    int EstimatedHours,
    double Progress,
    DateTime CreatedAt
);

public record RoadmapDetailDto(
    int Id,
    string Name,
    string? Description,
    string Color,
    List<RoadmapNodeDto> Nodes
);

public record RoadmapNodeDto(
    int Id,
    string Title,
    string? Description,
    string Status,
    string? Duration,
    string MediaType,
    int ResourceCount,
    int[] Prerequisites,
    int PositionX,
    int PositionY
);

public record CreateRoadmapDto(
    string Name,
    string? Description,
    string? Category,
    string? Color,
    string? Icon,
    string[]? Tags
);

public record CreateRoadmapNodeDto(
    string Title,
    string? Description,
    string? Duration,
    string MediaType,
    int ResourceCount,
    string? Status,
    int[]? PrerequisiteIds,
    int? FollowingNodeId,
    int? BesideNodeId,
    int? PositionX,
    int? PositionY
);

public record UpdateNodeStatusDto(string Status);

public record UpdateRoadmapNodeDto(
    string? Title,
    string? Description,
    string? Duration,
    string? MediaType,
    int? ResourceCount
);

public record UpdateRoadmapDto(
    string? Name,
    string? Description,
    string? Category,
    string? Color,
    string? Icon,
    string[]? Tags
);

public record AddPlaylistToRoadmapDto(
    int PlaylistId,
    int? AfterNodeId
);
