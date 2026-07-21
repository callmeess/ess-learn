using EssLearn.Core.Enums;

namespace EssLearn.Core.Entities;

public class RoadMap
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Color { get; set; } = "#3b82f6";
    public string? Icon { get; set; }
    public string? Tags { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<RoadmapNode> Nodes { get; set; } = [];
}
