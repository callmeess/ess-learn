namespace EssLearn.Core.Entities;

public class RoadmapNodePrerequisite
{
    public int NodeId { get; set; }
    public int PrerequisiteId { get; set; }
    public RoadmapNode Node { get; set; } = null!;
    public RoadmapNode Prerequisite { get; set; } = null!;
}
