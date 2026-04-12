namespace EssLearn.Core.Entities;

public class RoadmapNode
{
    public int Id { get; set; }
    public int RoadmapId { get; set; }
    public int PlaylistId { get; set; }
    public int Position { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public int LevelOrder { get; set; }
    public RoadmapNode? Parent { get; set; }
    public ICollection<RoadmapNode> Children { get; set; } = [];
    public RoadMap Roadmap { get; set; } = null!;
    public Playlist Playlist { get; set; } = null!;
}