using EssLearn.Api.Dtos;
using EssLearn.Core.Enums;
using EssLearn.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController(AppDbContext db, IDistributedCache cache) : ControllerBase
{
    private static readonly DistributedCacheEntryOptions CacheOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2)
    };

    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get()
    {
        const string cacheKey = "dashboard:stats";
        var cached = await cache.GetStringAsync(cacheKey);
        if (cached is not null)
            return Ok(JsonSerializer.Deserialize<DashboardDto>(cached));

        var fields = await db.LearningFields
            .Include(f => f.Playlists).ThenInclude(p => p.Videos).ThenInclude(v => v.Progress)
            .OrderBy(f => f.Name)
            .ToListAsync();

        var allVideos = fields.SelectMany(f => f.Playlists).SelectMany(p => p.Videos).ToList();

        var totalDuration = allVideos.Sum(v => v.DurationSeconds);
        var watchedSeconds = allVideos.Sum(v => v.Progress?.WatchedSeconds ?? 0);
        var completedVideos = allVideos.Count(v => v.Progress?.Status == VideoStatus.Completed);

        var fieldSummaries = fields.Select(f =>
        {
            var fVideos = f.Playlists.SelectMany(p => p.Videos).ToList();
            var fCompleted = fVideos.Count(v => v.Progress?.Status == VideoStatus.Completed);
            return new FieldSummaryDto(
                f.Id, f.Name, f.Color,
                f.Playlists.Count,
                fVideos.Count,
                fCompleted,
                fVideos.Count > 0 ? Math.Round((double)fCompleted / fVideos.Count * 100, 1) : 0
            );
        }).ToList();

        var recentlyWatched = await db.VideoProgresses
            .Where(p => p.LastWatchedAt != null)
            .OrderByDescending(p => p.LastWatchedAt)
            .Take(10)
            .Include(p => p.Video).ThenInclude(v => v.Playlist)
            .Select(p => new RecentVideoDto(
                p.VideoId,
                p.Video.Title,
                p.Video.ThumbnailUrl,
                p.Video.Playlist.Title,
                p.WatchedSeconds,
                p.Video.DurationSeconds,
                p.LastWatchedAt!.Value
            ))
            .ToListAsync();

        var dashboard = new DashboardDto(
            fields.Count,
            fields.Sum(f => f.Playlists.Count),
            allVideos.Count,
            completedVideos,
            totalDuration,
            watchedSeconds,
            allVideos.Count > 0 ? Math.Round((double)completedVideos / allVideos.Count * 100, 1) : 0,
            fieldSummaries,
            recentlyWatched
        );

        await cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(dashboard), CacheOptions);
        return Ok(dashboard);
    }
}
