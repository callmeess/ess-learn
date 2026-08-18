using EssLearn.Application.Dtos;
using EssLearn.Application.Dtos.BlobStorage;
using EssLearn.Application.Interfaces;
using EssLearn.Infrastructure.Data;
using EssLearn.Infrastructure.Services.BlobStorage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideosController(
    IVideoService videoService,
    IBlobStorageService blobStorage,
    BlobStorageOptions blobOptions,
    AppDbContext dbContext) : ControllerBase
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

    [HttpGet("{id}/thumbnail")]
    public async Task<IActionResult> GetThumbnail(int id)
    {
        var video = await dbContext.Videos
            .Include(v => v.Playlist)
            .FirstOrDefaultAsync(v => v.Id == id);

        if (video?.ThumbnailUrl is null)
            return NotFound();

        if (video.ThumbnailUrl.StartsWith("http"))
            return Redirect(video.ThumbnailUrl);

        try
        {
            var stream = await blobStorage.DownloadFileAsync(blobOptions.Buckets.Videos, video.ThumbnailUrl);
            return File(stream, "image/jpeg");
        }
        catch
        {
            return NotFound();
        }
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
