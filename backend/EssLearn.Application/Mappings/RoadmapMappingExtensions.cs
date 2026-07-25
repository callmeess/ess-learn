using EssLearn.Application.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Enums;

namespace EssLearn.Application.Mappings;

public static class RoadmapMappingExtensions
{
    public static RoadmapListItemDto ToListItemDto(this RoadMap r)
    {
        var nodes = r.Nodes.ToList();
        var totalNodes = nodes.Count;
        var completedNodes = nodes.Count(n => n.Status == RoadmapNodeStatus.Completed);
        var progress = totalNodes > 0 ? Math.Round((double)completedNodes / totalNodes * 100) : 0;

        var tags = string.IsNullOrWhiteSpace(r.Tags)
            ? []
            : r.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(t => t.Trim()).ToArray();

        return new RoadmapListItemDto(
            r.Id, r.Name, r.Description, r.Category, r.Color, r.Icon,
            tags, totalNodes, completedNodes, 0, progress, r.CreatedAt
        );
    }

    public static RoadmapDetailDto ToDetailDto(this RoadMap r)
    {
        var nodes = r.Nodes.Select(n => n.ToDto()).ToList();
        return new RoadmapDetailDto(r.Id, r.Name, r.Description, r.Color, nodes);
    }

    public static RoadmapNodeDto ToDto(this RoadmapNode n)
    {
        var prereqs = n.PrerequisitesOf.Select(p => p.PrerequisiteId).ToArray();
        return new RoadmapNodeDto(
            n.Id, n.Title, n.Description, n.Status.ToStatusString(),
            n.Duration, n.MediaType.ToMediaTypeString(), n.ResourceCount,
            prereqs, n.PositionX, n.PositionY
        );
    }

    public static string ToStatusString(this RoadmapNodeStatus status) => status switch
    {
        RoadmapNodeStatus.InProgress => "in-progress",
        RoadmapNodeStatus.Completed => "completed",
        RoadmapNodeStatus.Available => "available",
        RoadmapNodeStatus.Locked => "locked",
        _ => "not-started"
    };

    public static RoadmapNodeStatus ToStatus(this string? status) => status?.ToLower() switch
    {
        "in-progress" => RoadmapNodeStatus.InProgress,
        "completed" => RoadmapNodeStatus.Completed,
        "available" => RoadmapNodeStatus.Available,
        "locked" => RoadmapNodeStatus.Locked,
        _ => RoadmapNodeStatus.NotStarted
    };

    public static string ToMediaTypeString(this RoadmapMediaType type) =>
        type == RoadmapMediaType.Book ? "book" : "video";

    public static RoadmapMediaType ToMediaType(this string? type) =>
        type?.ToLower() == "book" ? RoadmapMediaType.Book : RoadmapMediaType.Video;
}
