using EssLearn.Core.Enums;

namespace EssLearn.Core.Entities;

public class RoadmapNode
{
    public int Id { get; set; }
    public int RoadmapId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public RoadmapNodeStatus Status { get; set; } = RoadmapNodeStatus.NotStarted;
    public string? Duration { get; set; }
    public RoadmapMediaType MediaType { get; set; } = RoadmapMediaType.Video;
    public int ResourceCount { get; set; } = 1;
    public int PositionX { get; set; }
    public int PositionY { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public RoadMap Roadmap { get; set; } = null!;

    public ICollection<RoadmapNodePrerequisite> PrerequisitesOf { get; set; } = [];
    public ICollection<RoadmapNodePrerequisite> DependentsOf { get; set; } = [];
}
