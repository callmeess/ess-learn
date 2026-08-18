using EssLearn.Application.Dtos;
using EssLearn.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoadmapsController(IRoadmapService roadmapService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<RoadmapListItemDto>>> GetAll()
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
    public async Task<ActionResult<RoadmapListItemDto>> Create(CreateRoadmapDto dto)
    {
        var roadmap = await roadmapService.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = roadmap.Id }, roadmap);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await roadmapService.DeleteAsync(id);
        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RoadmapListItemDto>> Update(int id, UpdateRoadmapDto dto)
    {
        var roadmap = await roadmapService.UpdateAsync(id, dto);
        if (roadmap is null) return NotFound();
        return Ok(roadmap);
    }

    [HttpPost("{id}/playlists")]
    public async Task<ActionResult<RoadmapNodeDto>> AddPlaylistToRoadmap(int id, AddPlaylistToRoadmapDto dto)
    {
        try
        {
            var node = await roadmapService.AddPlaylistToRoadmapAsync(id, dto);
            return Ok(node);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id}/nodes")]
    public async Task<ActionResult<RoadmapNodeDto>> AddNode(int id, CreateRoadmapNodeDto dto)
    {
        try
        {
            var node = await roadmapService.AddNodeAsync(id, dto);
            return Ok(node);
        }
        catch (InvalidOperationException)
        {
            return NotFound();
        }
    }

    [HttpPut("{roadmapId}/nodes/{nodeId}/status")]
    public async Task<ActionResult<RoadmapNodeDto>> UpdateNodeStatus(int roadmapId, int nodeId, UpdateNodeStatusDto dto)
    {
        var node = await roadmapService.UpdateNodeStatusAsync(roadmapId, nodeId, dto);
        if (node is null) return NotFound();
        return Ok(node);
    }

    [HttpPut("{roadmapId}/nodes/{nodeId}")]
    public async Task<ActionResult<RoadmapNodeDto>> UpdateNode(int roadmapId, int nodeId, UpdateRoadmapNodeDto dto)
    {
        var node = await roadmapService.UpdateNodeAsync(roadmapId, nodeId, dto);
        if (node is null) return NotFound();
        return Ok(node);
    }

    [HttpDelete("{roadmapId}/nodes/{nodeId}")]
    public async Task<IActionResult> DeleteNode(int roadmapId, int nodeId)
    {
        await roadmapService.DeleteNodeAsync(roadmapId, nodeId);
        return NoContent();
    }
}
