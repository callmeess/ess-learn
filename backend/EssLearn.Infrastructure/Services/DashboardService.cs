using EssLearn.Application.Dtos;
using EssLearn.Application.Interfaces;
using EssLearn.Core.Enums;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace EssLearn.Infrastructure.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _dbContext;
    private readonly IDistributedCache _cache;
    private static readonly DistributedCacheEntryOptions CacheOptions = new()
    {
        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(2)
    };

    private static readonly string[] SupportedRanges = ["all", "week", "month", "quarter"];

    public DashboardService(AppDbContext dbContext, IDistributedCache cache)
    {
        _dbContext = dbContext;
        _cache = cache;
    }

    public async Task<DashboardDto> GetAsync(string? range = null)
    {
        var normalized = NormalizeRange(range);
        var cacheKey = StatsCacheKeys.KeyFor(normalized);
        var cached = await _cache.GetStringAsync(cacheKey);
        if (cached is not null)
            return JsonSerializer.Deserialize<DashboardDto>(cached) ?? Empty();

        var from = RangeFrom(normalized);

        var fieldStats = await _dbContext.LearningFields
            .Select(f => new
            {
                f.Id,
                f.Name,
                f.Color,
                PlaylistCount = f.Playlists.Count(),
                VideoCount = f.Playlists.SelectMany(p => p.Videos).Count(),
                WatchedVideos = f.Playlists.SelectMany(p => p.Videos).Count(v => v.Progress != null && v.Progress.Status != VideoStatus.NotStarted),
                CompletedVideos = f.Playlists.SelectMany(p => p.Videos).Count(v =>
                    v.Progress != null &&
                    v.Progress.Status == VideoStatus.Completed &&
                    (from == null || v.Progress.CompletedAt >= from)),
                TotalDurationSeconds = f.Playlists.SelectMany(p => p.Videos).Sum(v => (long)v.DurationSeconds),
                WatchedSeconds = f.Playlists.SelectMany(p => p.Videos).Sum(v => v.Progress != null ? (long)v.Progress.WatchedSeconds : 0L)
            })
            .OrderBy(x => x.Name)
            .ToListAsync();

        var totalFields = fieldStats.Count;
        var totalPlaylists = fieldStats.Sum(f => f.PlaylistCount);
        var totalVideos = fieldStats.Sum(f => f.VideoCount);
        var watchedVideos = fieldStats.Sum(f => f.WatchedVideos);
        var completedVideos = fieldStats.Sum(f => f.CompletedVideos);
        var totalDuration = fieldStats.Sum(f => f.TotalDurationSeconds);
        var watchedSeconds = fieldStats.Sum(f => f.WatchedSeconds);

        var fieldSummaries = fieldStats.Select(f => new FieldSummaryDto(
            f.Id,
            f.Name,
            f.Color,
            f.PlaylistCount,
            f.VideoCount,
            f.WatchedVideos,
            f.CompletedVideos,
            f.TotalDurationSeconds,
            f.WatchedSeconds,
            f.VideoCount > 0 ? Math.Round((double)f.CompletedVideos / f.VideoCount * 100, 1) : 0
        )).ToList();

        var recentlyWatched = await _dbContext.VideoProgresses
            .Where(p => p.LastWatchedAt != null && (from == null || p.LastWatchedAt >= from))
            .OrderByDescending(p => p.LastWatchedAt)
            .Take(10)
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
            totalFields,
            totalPlaylists,
            totalVideos,
            watchedVideos,
            completedVideos,
            totalDuration,
            watchedSeconds,
            totalVideos > 0 ? Math.Round((double)completedVideos / totalVideos * 100, 1) : 0,
            fieldSummaries,
            recentlyWatched
        );

        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(dashboard), CacheOptions);
        return dashboard;
    }

    private static string NormalizeRange(string? range) =>
        SupportedRanges.Contains(range, StringComparer.OrdinalIgnoreCase) ? range!.ToLowerInvariant() : "all";

    private static DateTime? RangeFrom(string range) => range switch
    {
        "week" => DateTime.UtcNow.AddDays(-7),
        "month" => DateTime.UtcNow.AddDays(-30),
        "quarter" => DateTime.UtcNow.AddDays(-90),
        _ => null
    };

    private static DashboardDto Empty() => new(0, 0, 0, 0, 0, 0, 0, 0, [], []);
}
