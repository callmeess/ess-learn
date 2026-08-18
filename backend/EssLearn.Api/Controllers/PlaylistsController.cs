using EssLearn.Application.Dtos;
using EssLearn.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlaylistsController(IPlaylistService playlistService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<PlaylistDto>>> GetAll([FromQuery] int? fieldId)
    {
        var playlists = await playlistService.GetAllAsync(fieldId);
        return Ok(playlists);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PlaylistDetailDto>> Get(int id)
    {
        var playlist = await playlistService.GetByIdAsync(id);
        if (playlist is null) return NotFound();
        return Ok(playlist);
    }

    [HttpPost]
    public async Task<ActionResult<PlaylistDto>> Create(CreatePlaylistDto dto)
    {
        try
        {
            var playlist = await playlistService.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = playlist.Id }, playlist);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PlaylistDto>> Update(int id, UpdatePlaylistDto dto)
    {
        try
        {
            var playlist = await playlistService.UpdateAsync(id, dto);
            if (playlist is null) return NotFound();
            return Ok(playlist);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/videos")]
    public async Task<ActionResult<PaginatedVideosDto>> GetVideos(
        int id, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var result = await playlistService.GetVideosAsync(id, page, pageSize);
        return Ok(result);
    }

    [HttpPost("{id}/videos")]
    public async Task<IActionResult> AddVideos(int id, AddVideosToPlaylistDto dto)
    {
        try
        {
            await playlistService.AddVideosAsync(id, dto);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("Playlist not found"))
                return NotFound(new { message = ex.Message });
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}/videos/{videoId}")]
    public async Task<IActionResult> RemoveVideo(int id, int videoId)
    {
        var removed = await playlistService.RemoveVideoAsync(id, videoId);
        if (!removed) return NotFound();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await playlistService.DeleteAsync(id);
        return NoContent();
    }
}
