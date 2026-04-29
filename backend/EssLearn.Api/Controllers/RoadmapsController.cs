using EssLearn.Application.Dtos;
using EssLearn.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoadmapsController(IRoadmapService roadmapService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<RoadmapDto>>> GetAll()
    {
        var roadmaps = await roadmapService.GetAllAsync();
        return Ok(roadmaps);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RoadmapDetailDto>> Get(int id)
    {
        var roadmap = await roadmapService.GetByIdAsync(id);
        if (roadmap is null) return NotFound();
        return Ok(roadmap);
    }

    [HttpPost]
    public async Task<ActionResult<RoadmapDto>> Create(CreateRoadmapDto dto)
    {
        var roadmap = await roadmapService.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = roadmap.Id }, roadmap);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RoadmapDto>> Update(int id, UpdateRoadmapDto dto)
    {
        var roadmap = await roadmapService.UpdateAsync(id, dto);
        if (roadmap is null) return NotFound();
        return Ok(roadmap);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await roadmapService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{roadmapId}/playlists")]
    public async Task<ActionResult<RoadmapNodeDto>> AddPlaylist(int roadmapId, AddPlaylistToRoadmapDto dto)
    {
        var node = await roadmapService.AddPlaylistAsync(roadmapId, dto);
        return CreatedAtAction(nameof(Get), new { id = roadmapId }, node);
    }

    [HttpPut("nodes/{nodeId}")]
    public async Task<ActionResult<RoadmapNodeDto>> UpdateNode(int nodeId, UpdateRoadmapNodeDto dto)
    {
        var node = await roadmapService.UpdateNodeAsync(nodeId, dto);
        if (node is null) return NotFound();
        return Ok(node);
    }

    [HttpDelete("nodes/{nodeId}")]
    public async Task<IActionResult> RemoveNode(int nodeId)
    {
        await roadmapService.RemoveNodeAsync(nodeId);
        return NoContent();
    }
}
