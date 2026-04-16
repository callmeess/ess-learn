using EssLearn.Api.Dtos;
using EssLearn.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideosController(IVideoService videoService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<VideoListItemDto>>> GetAll([FromQuery] int? playlistId, [FromQuery] int? fieldId)
    {
        var videos = await videoService.GetAllAsync(playlistId, fieldId);
        return Ok(videos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VideoDto>> Get(int id)
    {
        var video = await videoService.GetByIdAsync(id);
        if (video is null) return NotFound();
        return Ok(video);
    }

    [HttpPut("{id}/progress")]
    public async Task<ActionResult<ProgressDto>> UpdateProgress(int id, UpdateProgressDto dto)
    {
        var result = await videoService.UpdateProgressAsync(id, dto);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet("{id}/progress")]
    public async Task<ActionResult<ProgressDto>> GetProgress(int id)
    {
        var progress = await videoService.GetProgressAsync(id);
        return Ok(progress);
    }
}
