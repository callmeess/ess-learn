using EssLearn.Application.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Enums;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Infrastructure.Services;

public class RoadmapService : IRoadmapService
{
    private readonly AppDbContext _dbContext;

    public RoadmapService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<RoadmapListItemDto>> GetAllAsync()
    {
        var roadmaps = await _dbContext.RoadMaps
            .Include(r => r.Nodes).ThenInclude(n => n.PrerequisitesOf)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return roadmaps.Select(MapListItem).ToList();
    }

    public async Task<RoadmapDetailDto?> GetByIdAsync(int id)
    {
        var roadmap = await _dbContext.RoadMaps
            .Include(r => r.Nodes).ThenInclude(n => n.PrerequisitesOf)
            .FirstOrDefaultAsync(r => r.Id == id);

        return roadmap == null ? null : MapDetail(roadmap);
    }

    public async Task<RoadmapListItemDto> CreateAsync(CreateRoadmapDto dto)
    {
        var roadmap = new RoadMap
        {
            Name = dto.Name,
            Description = dto.Description,
            Category = dto.Category ?? "Custom",
            Color = dto.Color ?? "#3b82f6",
            Icon = dto.Icon,
            Tags = dto.Tags != null ? string.Join(",", dto.Tags) : null
        };

        _dbContext.RoadMaps.Add(roadmap);
        await _dbContext.SaveChangesAsync();

        return MapListItem(roadmap);
    }

    public async Task DeleteAsync(int id)
    {
        var roadmap = await _dbContext.RoadMaps.FindAsync(id);
        if (roadmap != null)
        {
            _dbContext.RoadMaps.Remove(roadmap);
            await _dbContext.SaveChangesAsync();
        }
    }

    public async Task<RoadmapNodeDto> AddNodeAsync(int roadmapId, CreateRoadmapNodeDto dto)
    {
        var roadmap = await _dbContext.RoadMaps
            .Include(r => r.Nodes).ThenInclude(n => n.PrerequisitesOf)
            .FirstOrDefaultAsync(r => r.Id == roadmapId)
            ?? throw new InvalidOperationException("Roadmap not found");

        var mediaType = dto.MediaType?.ToLower() == "book" ? RoadmapMediaType.Book : RoadmapMediaType.Video;
        var status = ParseStatus(dto.Status);

        var node = new RoadmapNode
        {
            RoadmapId = roadmapId,
            Title = dto.Title,
            Description = dto.Description,
            Duration = dto.Duration,
            MediaType = mediaType,
            ResourceCount = Math.Max(1, dto.ResourceCount),
            Status = status,
            PositionX = dto.PositionX ?? 0,
            PositionY = dto.PositionY ?? 0
        };

        _dbContext.RoadmapNodes.Add(node);
        await _dbContext.SaveChangesAsync();

        if (dto.PrerequisiteIds is { Length: > 0 })
        {
            foreach (var prereqId in dto.PrerequisiteIds)
            {
                _dbContext.RoadmapNodePrerequisites.Add(new RoadmapNodePrerequisite
                {
                    NodeId = node.Id,
                    PrerequisiteId = prereqId
                });
            }
            await _dbContext.SaveChangesAsync();
        }

        if (dto.FollowingNodeId.HasValue)
        {
            var exists = await _dbContext.RoadmapNodePrerequisites
                .AnyAsync(p => p.NodeId == dto.FollowingNodeId.Value && p.PrerequisiteId == node.Id);

            if (!exists)
            {
                _dbContext.RoadmapNodePrerequisites.Add(new RoadmapNodePrerequisite
                {
                    NodeId = dto.FollowingNodeId.Value,
                    PrerequisiteId = node.Id
                });
                await _dbContext.SaveChangesAsync();
            }
        }

        // Reload with prerequisites
        var reloaded = await _dbContext.RoadmapNodes
            .Include(n => n.PrerequisitesOf)
            .FirstAsync(n => n.Id == node.Id);

        return MapNode(reloaded);
    }

    public async Task<RoadmapNodeDto?> UpdateNodeStatusAsync(int roadmapId, int nodeId, UpdateNodeStatusDto dto)
    {
        var node = await _dbContext.RoadmapNodes
            .Include(n => n.PrerequisitesOf)
            .Include(n => n.DependentsOf).ThenInclude(d => d.Node).ThenInclude(n => n.PrerequisitesOf)
            .FirstOrDefaultAsync(n => n.Id == nodeId && n.RoadmapId == roadmapId);

        if (node == null) return null;

        node.Status = ParseStatus(dto.Status);
        node.UpdatedAt = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();

        if (node.Status == RoadmapNodeStatus.Completed)
        {
            await UnlockDependentNodesAsync(node);
        }

        // Reload
        var reloaded = await _dbContext.RoadmapNodes
            .Include(n => n.PrerequisitesOf)
            .FirstAsync(n => n.Id == nodeId);

        return MapNode(reloaded);
    }

    public async Task DeleteNodeAsync(int roadmapId, int nodeId)
    {
        var node = await _dbContext.RoadmapNodes
            .FirstOrDefaultAsync(n => n.Id == nodeId && n.RoadmapId == roadmapId);

        if (node != null)
        {
            _dbContext.RoadmapNodes.Remove(node);
            await _dbContext.SaveChangesAsync();
        }
    }

    public async Task<RoadmapNodeDto?> UpdateNodeAsync(int roadmapId, int nodeId, UpdateRoadmapNodeDto dto)
    {
        var node = await _dbContext.RoadmapNodes
            .Include(n => n.PrerequisitesOf)
            .FirstOrDefaultAsync(n => n.Id == nodeId && n.RoadmapId == roadmapId);

        if (node == null) return null;

        if (dto.Title != null) node.Title = dto.Title;
        if (dto.Description != null) node.Description = dto.Description;
        if (dto.Duration != null) node.Duration = dto.Duration;
        if (dto.ResourceCount.HasValue) node.ResourceCount = Math.Max(1, dto.ResourceCount.Value);
        if (dto.MediaType != null)
            node.MediaType = dto.MediaType.ToLower() == "book" ? RoadmapMediaType.Book : RoadmapMediaType.Video;

        node.UpdatedAt = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        var reloaded = await _dbContext.RoadmapNodes
            .Include(n => n.PrerequisitesOf)
            .FirstAsync(n => n.Id == nodeId);

        return MapNode(reloaded);
    }

    private async Task UnlockDependentNodesAsync(RoadmapNode completedNode)
    {
        var dependents = await _dbContext.RoadmapNodePrerequisites
            .Where(p => p.PrerequisiteId == completedNode.Id)
            .Select(p => p.Node)
            .Include(n => n.PrerequisitesOf)
            .ToListAsync();

        foreach (var dependent in dependents)
        {
            if (dependent.Status != RoadmapNodeStatus.Locked) continue;

            var allPrereqsComplete = await _dbContext.RoadmapNodePrerequisites
                .Where(p => p.NodeId == dependent.Id)
                .AllAsync(p => p.Prerequisite.Status == RoadmapNodeStatus.Completed);

            if (allPrereqsComplete)
            {
                dependent.Status = RoadmapNodeStatus.Available;
                dependent.UpdatedAt = DateTime.UtcNow;
            }
        }

        await _dbContext.SaveChangesAsync();
    }

    private static RoadmapNodeStatus ParseStatus(string? status)
    {
        return status?.ToLower() switch
        {
            "in-progress" => RoadmapNodeStatus.InProgress,
            "completed" => RoadmapNodeStatus.Completed,
            "available" => RoadmapNodeStatus.Available,
            "locked" => RoadmapNodeStatus.Locked,
            _ => RoadmapNodeStatus.NotStarted
        };
    }

    private static string StatusToString(RoadmapNodeStatus status)
    {
        return status switch
        {
            RoadmapNodeStatus.InProgress => "in-progress",
            RoadmapNodeStatus.Completed => "completed",
            RoadmapNodeStatus.Available => "available",
            RoadmapNodeStatus.Locked => "locked",
            _ => "not-started"
        };
    }

    private static string MediaTypeToString(RoadmapMediaType type)
    {
        return type == RoadmapMediaType.Book ? "book" : "video";
    }

    private static RoadmapListItemDto MapListItem(RoadMap r)
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

    private static RoadmapDetailDto MapDetail(RoadMap r)
    {
        var nodes = r.Nodes.Select(MapNode).ToList();
        return new RoadmapDetailDto(r.Id, r.Name, r.Description, r.Color, nodes);
    }

    private static RoadmapNodeDto MapNode(RoadmapNode n)
    {
        var prereqs = n.PrerequisitesOf.Select(p => p.PrerequisiteId).ToArray();
        return new RoadmapNodeDto(
            n.Id, n.Title, n.Description, StatusToString(n.Status),
            n.Duration, MediaTypeToString(n.MediaType), n.ResourceCount,
            prereqs, n.PositionX, n.PositionY
        );
    }
}
