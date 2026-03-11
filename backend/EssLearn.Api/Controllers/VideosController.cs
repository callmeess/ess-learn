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
        var v = await db.Videos
            .Include(v => v.Progress)
            .Include(v => v.DownloadedVideo)
            .FirstOrDefaultAsync(v => v.Id == id);
        if (v is null) return NotFound();
        return MapVideo(v);
    }

    [HttpPut("{id}/progress")]
    public async Task<ActionResult<ProgressDto>> UpdateProgress(int id, UpdateProgressDto dto)
    {
        Console.WriteLine($"[VideosController] UpdateProgress called for video {id}: WatchedSeconds={dto.WatchedSeconds}, Status={dto.Status}");
        
        var video = await db.Videos.Include(v => v.Progress).FirstOrDefaultAsync(v => v.Id == id);
        if (video is null)
        {
            Console.WriteLine($"[VideosController] Video {id} not found");
            return NotFound();
        }

        var progress = video.Progress;
        if (progress is null)
        {
            Console.WriteLine($"[VideosController] Creating new progress record for video {id}");
            progress = new VideoProgress { VideoId = id };
            db.VideoProgresses.Add(progress);
            video.Progress = progress;
        }

        progress.WatchedSeconds = dto.WatchedSeconds;
        progress.Status = dto.Status;
        progress.LastWatchedAt = DateTime.UtcNow;
        progress.UpdatedAt = DateTime.UtcNow;

        if (dto.Status == VideoStatus.Completed && progress.CompletedAt is null)
        {
            progress.CompletedAt = DateTime.UtcNow;
            Console.WriteLine($"[VideosController] Video {id} marked as completed");
        }

        await db.SaveChangesAsync();
        Console.WriteLine($"[VideosController] Progress saved for video {id}");

        return new ProgressDto(id, progress.Status, progress.WatchedSeconds, progress.LastWatchedAt, progress.CompletedAt);
    }

    [HttpGet("{id}/progress")]
    public async Task<ActionResult<ProgressDto>> GetProgress(int id)
    {
        Console.WriteLine($"[VideosController] GetProgress called for video {id}");
        var progress = await db.VideoProgresses.FirstOrDefaultAsync(p => p.VideoId == id);
        if (progress is null)
        {
            Console.WriteLine($"[VideosController] No progress found for video {id}, returning default");
            return new ProgressDto(id, VideoStatus.NotStarted, 0, null, null);
        }

        Console.WriteLine($"[VideosController] Progress found for video {id}: {progress.WatchedSeconds}s, Status={progress.Status}");
        return new ProgressDto(id, progress.Status, progress.WatchedSeconds, progress.LastWatchedAt, progress.CompletedAt);
    }

    private static VideoDto MapVideo(Video v) => new(
        v.Id, v.PlaylistId, v.YoutubeVideoId, v.Title, v.ThumbnailUrl, v.Url,
        v.DurationSeconds, v.Position,
        v.Progress?.Status ?? VideoStatus.NotStarted,
        v.Progress?.WatchedSeconds ?? 0
    );
}
