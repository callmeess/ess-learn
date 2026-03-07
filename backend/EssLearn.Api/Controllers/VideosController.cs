using EssLearn.Api.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Enums;
using EssLearn.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VideosController(AppDbContext db) : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<VideoDto>> Get(int id)
    {
        var v = await db.Videos.Include(v => v.Progress).FirstOrDefaultAsync(v => v.Id == id);
        if (v is null) return NotFound();
        return MapVideo(v);
    }

    [HttpPut("{id}/progress")]
    public async Task<ActionResult<ProgressDto>> UpdateProgress(int id, UpdateProgressDto dto)
    {
        var video = await db.Videos.Include(v => v.Progress).FirstOrDefaultAsync(v => v.Id == id);
        if (video is null) return NotFound();

        var progress = video.Progress;
        if (progress is null)
        {
            progress = new VideoProgress { VideoId = id };
            db.VideoProgresses.Add(progress);
            video.Progress = progress;
        }

        progress.WatchedSeconds = dto.WatchedSeconds;
        progress.Status = dto.Status;
        progress.LastWatchedAt = DateTime.UtcNow;
        progress.UpdatedAt = DateTime.UtcNow;

        if (dto.Status == VideoStatus.Completed && progress.CompletedAt is null)
            progress.CompletedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return new ProgressDto(id, progress.Status, progress.WatchedSeconds, progress.LastWatchedAt, progress.CompletedAt);
    }

    [HttpGet("{id}/progress")]
    public async Task<ActionResult<ProgressDto>> GetProgress(int id)
    {
        var progress = await db.VideoProgresses.FirstOrDefaultAsync(p => p.VideoId == id);
        if (progress is null)
            return new ProgressDto(id, VideoStatus.NotStarted, 0, null, null);

        return new ProgressDto(id, progress.Status, progress.WatchedSeconds, progress.LastWatchedAt, progress.CompletedAt);
    }

    private static VideoDto MapVideo(Video v) => new(
        v.Id, v.PlaylistId, v.YoutubeVideoId, v.Title, v.ThumbnailUrl, v.Url,
        v.DurationSeconds, v.Position,
        v.Progress?.Status ?? VideoStatus.NotStarted,
        v.Progress?.WatchedSeconds ?? 0
    );
}
