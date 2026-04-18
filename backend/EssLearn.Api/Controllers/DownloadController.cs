using EssLearn.Api.Dtos;
using EssLearn.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/videos/{videoId}/[controller]")]
public class DownloadController(IDownloadService downloadService) : ControllerBase
{
    IDownloadService _downloadService  = downloadService;

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
    public async Task<ActionResult<object>> GetDownloadStatus(int videoId)
    {
        var status = await _downloadService.GetDownloadStatusAsync(videoId);
        return Ok(status);
    }

    private static string FormatFileSize(long bytes)
    {
        if (bytes == 0) return "Unknown";
        
        string[] sizes = { "B", "KB", "MB", "GB" };
        int order = 0;
        double size = bytes;
        
        while (size >= 1024 && order < sizes.Length - 1)
        {
            order++;
            size /= 1024;
        }
        
        return $"{size:0.##} {sizes[order]}";
    }
}
