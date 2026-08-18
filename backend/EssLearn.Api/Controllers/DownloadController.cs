using EssLearn.Application.Dtos;
using EssLearn.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/videos/{videoId}/[controller]")]
public class DownloadController(IDownloadService downloadService) : ControllerBase
{
    IDownloadService _downloadService = downloadService;

    [HttpGet("formats")]
    public async Task<ActionResult<List<VideoFormatDto>>> GetFormats(int videoId)
    {
        try
        {
            var formats = await _downloadService.GetFormatsAsync(videoId);
            return Ok(formats);
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<ActionResult<DownloadedVideoDto>> DownloadVideo(int videoId, [FromBody] DownloadVideoDto dto)
    {
        try
        {
            var result = await _downloadService.DownloadVideoAsync(videoId, dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteDownload(int videoId)
    {
        try
        {
            await _downloadService.DeleteDownloadAsync(videoId);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("status")]
    public async Task<ActionResult<DownloadStatusResponseDto>> GetDownloadStatus(int videoId)
    {
        var status = await _downloadService.GetDownloadStatusAsync(videoId);
        return Ok(status);
    }

    [HttpGet("progress")]
    public async Task<ActionResult<DownloadProgressResponseDto>> GetDownloadProgress(int videoId)
    {
        var progress = await _downloadService.GetDownloadProgressAsync(videoId);
        return Ok(progress);
    }
}
