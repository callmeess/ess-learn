using EssLearn.Api.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PlaylistsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<PlaylistDto>>> GetAll([FromQuery] int? fieldId)
    {
        var query = db.Playlists
            .Include(p => p.Videos).ThenInclude(v => v.Progress)
            .Include(p => p.Channel)
            .AsQueryable();

        if (fieldId.HasValue)
            query = query.Where(p => p.FieldId == fieldId.Value);

        var playlists = await query.OrderByDescending(p => p.CreatedAt).ToListAsync();
        return playlists.Select(MapPlaylist).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PlaylistDetailDto>> Get(int id)
    {
        var playlist = await db.Playlists
            .Include(p => p.Videos.OrderBy(v => v.Position)).ThenInclude(v => v.Progress)
            .Include(p => p.Channel)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (playlist is null) return NotFound();

        var videos = playlist.Videos.Select(v => new VideoDto(
            v.Id, v.PlaylistId, v.YoutubeVideoId, v.Title, v.ThumbnailUrl, v.Url,
            v.DurationSeconds, v.Position,
            v.Progress?.Status ?? Core.Enums.VideoStatus.NotStarted,
            v.Progress?.WatchedSeconds ?? 0
        )).ToList();

        return new PlaylistDetailDto(MapPlaylist(playlist), videos);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var playlist = await db.Playlists.FindAsync(id);
        if (playlist is null) return NotFound();
        db.Playlists.Remove(playlist);
        await db.SaveChangesAsync();
        return NoContent();
    }

    internal static PlaylistDto MapPlaylist(Playlist p)
    {
        var videos = p.Videos.ToList();
        return new PlaylistDto(
            p.Id, p.FieldId, p.Title, p.Description, p.ThumbnailUrl, p.SourceUrl,
            videos.Count,
            videos.Count(v => v.Progress?.Status == Core.Enums.VideoStatus.Completed),
            videos.Sum(v => v.DurationSeconds),
            videos.Sum(v => v.Progress?.WatchedSeconds ?? 0),
            p.Channel?.Title,
            p.CreatedAt
        );
    }
}
