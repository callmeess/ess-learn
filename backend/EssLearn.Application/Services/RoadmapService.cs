using EssLearn.Application.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Infrastructure.Services;

public class RoadmapService : IRoadmapService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _dbContext;

    public RoadmapService(IUnitOfWork unitOfWork, AppDbContext dbContext)
    {
        _unitOfWork = unitOfWork;
        _dbContext = dbContext;
    }

    public async Task<List<RoadmapDto>> GetAllAsync()
    {
        var roadmaps = await _dbContext.Roadmaps
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return roadmaps.Select(MapRoadmapToDto).ToList();
    }

    public async Task<RoadmapDetailDto?> GetByIdAsync(int id)
    {
        var roadmap = await _dbContext.Roadmaps
            .Include(r => r.Playlists)
                .ThenInclude(rn => rn.Playlist)
                    .ThenInclude(p => p.Videos)
                        .ThenInclude(v => v.Progress)
            .Include(r => r.Playlists)
                .ThenInclude(rn => rn.Children)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (roadmap is null) return null;

        var nodes = MapRoadmapNodesToDto(roadmap.Playlists.Where(rn => rn.Parent == null).ToList());

        return new RoadmapDetailDto(
            roadmap.Id,
            roadmap.Name,
            roadmap.Description,
            roadmap.Iconurl,
            roadmap.Progress,
            nodes,
            roadmap.CreatedAt,
            roadmap.UpdatedAt
        );
    }

    public async Task<RoadmapDto> CreateAsync(CreateRoadmapDto dto)
    {
        var roadmap = new RoadMap
        {
            Name = dto.Name,
            Description = dto.Description,
            Iconurl = dto.IconUrl,
            Progress = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Roadmaps.Add(roadmap);
        await _dbContext.SaveChangesAsync();

        return MapRoadmapToDto(roadmap);
    }

    public async Task<RoadmapDto?> UpdateAsync(int id, UpdateRoadmapDto dto)
    {
        var roadmap = await _dbContext.Roadmaps.FirstOrDefaultAsync(r => r.Id == id);
        if (roadmap is null) return null;

        roadmap.Name = dto.Name;
        roadmap.Description = dto.Description;
        roadmap.Iconurl = dto.IconUrl;
        roadmap.UpdatedAt = DateTime.UtcNow;

        _dbContext.Roadmaps.Update(roadmap);
        await _dbContext.SaveChangesAsync();

        return MapRoadmapToDto(roadmap);
    }

    public async Task DeleteAsync(int id)
    {
        var roadmap = await _dbContext.Roadmaps.FirstOrDefaultAsync(r => r.Id == id);
        if (roadmap is not null)
        {
            _dbContext.Roadmaps.Remove(roadmap);
            await _dbContext.SaveChangesAsync();
        }
    }

    public async Task<RoadmapNodeDto> AddPlaylistAsync(int roadmapId, AddPlaylistToRoadmapDto dto)
    {
        // Verify roadmap exists
        var roadmap = await _dbContext.Roadmaps.FirstOrDefaultAsync(r => r.Id == roadmapId);
        if (roadmap is null)
            throw new InvalidOperationException("Roadmap not found.");

        // Verify playlist exists
        var playlist = await _dbContext.Playlists.FirstOrDefaultAsync(p => p.Id == dto.PlaylistId);
        if (playlist is null)
            throw new InvalidOperationException("Playlist not found.");

        // Check if playlist is already in roadmap
        var existingNode = await _dbContext.RoadmapNodes
            .FirstOrDefaultAsync(rn => rn.RoadmapId == roadmapId && rn.PlaylistId == dto.PlaylistId);
        if (existingNode is not null)
            throw new InvalidOperationException("Playlist is already in this roadmap.");

        // Get parent node if specified
        RoadmapNode? parentNode = null;
        if (dto.ParentNodeId.HasValue)
        {
            parentNode = await _dbContext.RoadmapNodes
                .FirstOrDefaultAsync(rn => rn.Id == dto.ParentNodeId.Value && rn.RoadmapId == roadmapId);
            if (parentNode is null)
                throw new InvalidOperationException("Parent node not found.");
        }

        var node = new RoadmapNode
        {
            RoadmapId = roadmapId,
            PlaylistId = dto.PlaylistId,
            Position = dto.Position,
            LevelOrder = dto.LevelOrder,
            Parent = parentNode,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.RoadmapNodes.Add(node);
        await _dbContext.SaveChangesAsync();

        // Load the playlist data for the DTO
        node = await _dbContext.RoadmapNodes
            .Include(rn => rn.Playlist)
            .Include(rn => rn.Parent)
            .Include(rn => rn.Children)
            .FirstAsync(rn => rn.Id == node.Id);

        return MapRoadmapNodeToDto(node);
    }

    public async Task<RoadmapNodeDto?> UpdateNodeAsync(int nodeId, UpdateRoadmapNodeDto dto)
    {
        var node = await _dbContext.RoadmapNodes
            .Include(rn => rn.Playlist)
            .Include(rn => rn.Parent)
            .Include(rn => rn.Children)
            .FirstOrDefaultAsync(rn => rn.Id == nodeId);

        if (node is null) return null;

        // If parent is changing
        if (dto.ParentNodeId.HasValue && dto.ParentNodeId != node.Parent?.Id)
        {
            var newParent = await _dbContext.RoadmapNodes
                .FirstOrDefaultAsync(rn => rn.Id == dto.ParentNodeId.Value && rn.RoadmapId == node.RoadmapId);
            if (newParent is null)
                throw new InvalidOperationException("New parent node not found.");

            node.Parent = newParent;
        }
        else if (!dto.ParentNodeId.HasValue)
        {
            node.Parent = null;
        }

        node.Position = dto.Position;
        node.LevelOrder = dto.LevelOrder;
        node.UpdatedAt = DateTime.UtcNow;

        _dbContext.RoadmapNodes.Update(node);
        await _dbContext.SaveChangesAsync();

        return MapRoadmapNodeToDto(node);
    }

    public async Task RemoveNodeAsync(int nodeId)
    {
        var node = await _dbContext.RoadmapNodes.FirstOrDefaultAsync(rn => rn.Id == nodeId);
        if (node is not null)
        {
            // Remove all children
            var children = await _dbContext.RoadmapNodes
                .Where(rn => rn.Parent != null && rn.Parent.Id == nodeId)
                .ToListAsync();
            _dbContext.RoadmapNodes.RemoveRange(children);

            _dbContext.RoadmapNodes.Remove(node);
            await _dbContext.SaveChangesAsync();
        }
    }

    private RoadmapDto MapRoadmapToDto(RoadMap roadmap)
    {
        return new RoadmapDto(
            roadmap.Id,
            roadmap.Name,
            roadmap.Description,
            roadmap.Iconurl,
            roadmap.Progress,
            roadmap.CreatedAt,
            roadmap.UpdatedAt
        );
    }

    private RoadmapNodeDto MapRoadmapNodeToDto(RoadmapNode node)
    {
        var children = node.Children?.Select(MapRoadmapNodeToDto).ToList() ?? [];

        return new RoadmapNodeDto(
            node.Id,
            node.RoadmapId,
            node.PlaylistId,
            MapPlaylistToDto(node.Playlist),
            node.Position,
            node.LevelOrder,
            node.Parent != null ? MapRoadmapNodeToDto(node.Parent) : null,
            children,
            node.CreatedAt,
            node.UpdatedAt
        );
    }

    private List<RoadmapNodeDto> MapRoadmapNodesToDto(List<RoadmapNode> nodes)
    {
        return nodes.Select(MapRoadmapNodeToDto).ToList();
    }

    private PlaylistDto MapPlaylistToDto(Playlist playlist)
    {
        var completedVideos = playlist.Videos?.Count(v => v.Progress?.Status == Core.Enums.VideoStatus.Completed) ?? 0;
        var totalDurationSeconds = playlist.Videos?.Sum(v => v.DurationSeconds) ?? 0;
        var watchedSeconds = playlist.Videos?.Sum(v => v.Progress?.WatchedSeconds ?? 0) ?? 0;

        return new PlaylistDto(
            playlist.Id,
            playlist.FieldId,
            playlist.Title,
            playlist.Description,
            playlist.ThumbnailUrl,
            playlist.SourceUrl,
            playlist.Videos?.Count ?? 0,
            completedVideos,
            totalDurationSeconds,
            watchedSeconds,
            playlist.Channel?.Title,
            playlist.CreatedAt
        );
    }
}
