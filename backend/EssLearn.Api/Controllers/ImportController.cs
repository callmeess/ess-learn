using EssLearn.Application.Dtos;
using EssLearn.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImportController(IImportService importService) : ControllerBase
{
    [HttpPost("playlist")]
    public async Task<ActionResult<ImportResultDto>> ImportPlaylist(ImportPlaylistDto dto)
    {
        try
        {
            var result = await importService.ImportPlaylistAsync(dto);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            if (ex.Message.Contains("already been imported"))
                return Conflict(new { message = ex.Message });
            return BadRequest(new { message = ex.Message });
        }
    }
}
