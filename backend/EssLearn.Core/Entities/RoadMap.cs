namespace EssLearn.Core.Entities;

public class RoadMap
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Iconurl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public double Progress { get; set; }
    public ICollection<RoadmapNode> Playlists { get; set; } = [];
}
