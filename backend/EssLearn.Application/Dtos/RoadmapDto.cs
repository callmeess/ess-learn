namespace EssLearn.Application.Dtos;

// --- Roadmaps ---
public record RoadmapDto(
    int Id,
    string Name,
    string? Description,
    string? IconUrl,
    double Progress,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record RoadmapDetailDto(
    int Id,
    string Name,
    string? Description,
    string? IconUrl,
    double Progress,
    List<RoadmapNodeDto> Nodes,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record RoadmapNodeDto(
    int Id,
    int RoadmapId,
    int PlaylistId,
    PlaylistDto Playlist,
    int Position,
    int LevelOrder,
    RoadmapNodeDto? Parent,
    List<RoadmapNodeDto> Children,
    DateTime CreatedAt,
    DateTime UpdatedAt
);

public record CreateRoadmapDto(
    string Name,
    string? Description,
    string? IconUrl
);

public record UpdateRoadmapDto(
    string Name,
    string? Description,
    string? IconUrl
);

public record AddPlaylistToRoadmapDto(
    int PlaylistId,
    int Position,
    int LevelOrder,
    int? ParentNodeId = null
);

public record UpdateRoadmapNodeDto(
    int Position,
    int LevelOrder,
    int? ParentNodeId = null
);
