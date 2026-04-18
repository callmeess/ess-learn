using EssLearn.Application.Dtos;
using EssLearn.Core.Interfaces;
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

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await playlistService.DeleteAsync(id);
        return NoContent();
    }
}
