using EssLearn.Api.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImportController(AppDbContext db, IYouTubeService youtube, IConfiguration config, ILogger<ImportController> logger) : ControllerBase
{
    private readonly string _offlineDataRoot = Path.GetFullPath(config["OfflineData:RootPath"] ?? "/data");

    [HttpPost("playlist")]
    public async Task<ActionResult<ImportResultDto>> ImportPlaylist(ImportPlaylistDto dto)
    {
        // Verify field exists
        var field = await db.LearningFields.FindAsync(dto.FieldId);
        if (field is null) return BadRequest(new { message = "Learning field not found." });

        var source = (dto.Source ?? "youtube").Trim().ToLowerInvariant();
        if (source is not ("youtube" or "offline"))
            return BadRequest(new { message = "source must be either 'youtube' or 'offline'." });

        Playlist playlist;
        Channel channel;
        List<Video> videos;

        try
        {
            if (source == "offline")
            {
                if (string.IsNullOrWhiteSpace(dto.OfflineManifestPath))
                    return BadRequest(new { message = "offlineManifestPath is required when source is offline." });

                var importData = await LoadOfflineImportDataAsync(dto.OfflineManifestPath, dto.FieldId);
                playlist = importData.Playlist;
                channel = importData.Channel;
                videos = importData.Videos;
            }
            else
            {
                if (string.IsNullOrWhiteSpace(dto.PlaylistUrl))
                    return BadRequest(new { message = "playlistUrl is required when source is youtube." });

                // Check if already imported
                var existingPlaylistId = ExtractYoutubePlaylistId(dto.PlaylistUrl);
                if (existingPlaylistId != null)
                {
                    var exists = await db.Playlists.AnyAsync(p => p.YoutubePlaylistId == existingPlaylistId);
                    if (exists) return Conflict(new { message = "This playlist has already been imported." });
                }

                (playlist, channel, videos) = await youtube.ImportPlaylistAsync(dto.PlaylistUrl, dto.FieldId);
            }
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        // Upsert channel
        var existingChannel = await db.Channels.FirstOrDefaultAsync(c => c.YoutubeChannelId == channel.YoutubeChannelId);
        if (existingChannel is not null)
        {
            existingChannel.Title = channel.Title;
            existingChannel.ThumbnailUrl = channel.ThumbnailUrl;
            existingChannel.SubscriberCount = channel.SubscriberCount;
            existingChannel.UpdatedAt = DateTime.UtcNow;
            playlist.Channel = existingChannel;
        }
        else
        {
            db.Channels.Add(channel);
            playlist.Channel = channel;
        }

        db.Playlists.Add(playlist);
        foreach (var video in videos)
        {
            video.Playlist = playlist;
            db.Videos.Add(video);
        }

        await db.SaveChangesAsync();

        return Ok(new ImportResultDto(playlist.Id, playlist.Title, videos.Count, channel.Title));
    }

    private static string? ExtractYoutubePlaylistId(string url)
    {
        if (!url.Contains('?')) return null;
        var match = System.Text.RegularExpressions.Regex.Match(url, @"[?&]list=([a-zA-Z0-9_-]+)");
        return match.Success ? match.Groups[1].Value : null;
    }

    private async Task<(Playlist Playlist, Channel Channel, List<Video> Videos)> LoadOfflineImportDataAsync(string manifestPath, int fieldId)
    {
        if (!Directory.Exists(_offlineDataRoot))
            throw new InvalidOperationException($"Offline data root path not found: {_offlineDataRoot}");

        var fullManifestPath = ResolvePathInOfflineRoot(manifestPath);
        if (!System.IO.File.Exists(fullManifestPath))
            throw new ArgumentException($"Offline manifest file not found: {manifestPath}");

        await using var stream = System.IO.File.OpenRead(fullManifestPath);
        var manifest = await JsonSerializer.DeserializeAsync<OfflinePlaylistManifest>(stream, new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        });

        if (manifest is null)
            throw new ArgumentException("Invalid offline manifest.");

        var channel = new Channel
        {
            YoutubeChannelId = manifest.Channel?.YoutubeChannelId ?? $"offline-{Guid.NewGuid():N}",
            Title = manifest.Channel?.Title ?? "Offline Source",
            Description = manifest.Channel?.Description,
            ThumbnailUrl = manifest.Channel?.ThumbnailUrl,
            SubscriberCount = manifest.Channel?.SubscriberCount ?? 0
        };

        var playlistSource = (manifest.PlaylistMetadataSource ?? "offline").Trim().ToLowerInvariant();
        Playlist playlist;
        if (playlistSource == "youtube")
        {
            if (string.IsNullOrWhiteSpace(manifest.PlaylistUrl))
                throw new ArgumentException("playlistUrl is required when playlistMetadataSource is youtube.");

            var (ytPlaylist, ytChannel, _) = await youtube.ImportPlaylistAsync(manifest.PlaylistUrl, fieldId);
            playlist = ytPlaylist;
            channel = ytChannel;
        }
        else
        {
            playlist = new Playlist
            {
                FieldId = fieldId,
                Title = manifest.Title ?? Path.GetFileNameWithoutExtension(fullManifestPath),
                Description = manifest.Description,
                ThumbnailUrl = ToMediaUrl(manifest.ThumbnailUrl),
                SourceUrl = $"offline:{manifestPath}",
                PublishedAt = manifest.PublishedAt
            };
        }

        var videos = await BuildOfflineVideosAsync(manifest.Videos ?? []);
        playlist.TotalVideos = videos.Count;
        return (playlist, channel, videos);
    }

    private async Task<List<Video>> BuildOfflineVideosAsync(List<OfflineVideoManifest> manifests)
    {
        var youtubeIds = manifests
            .Where(v => string.Equals(v.MetadataSource, "youtube", StringComparison.OrdinalIgnoreCase))
            .Select(v => v.YoutubeVideoId)
            .Where(id => !string.IsNullOrWhiteSpace(id))
            .Select(id => id!)
            .Distinct()
            .ToList();

        var youtubeMetadata = youtubeIds.Count > 0
            ? await TryGetYouTubeMetadataAsync(youtubeIds)
            : [];

        var videos = new List<Video>(manifests.Count);
        for (var i = 0; i < manifests.Count; i++)
        {
            var item = manifests[i];
            var source = (item.MetadataSource ?? "offline").Trim().ToLowerInvariant();
            youtubeMetadata.TryGetValue(item.YoutubeVideoId ?? string.Empty, out var yt);

            videos.Add(new Video
            {
                YoutubeVideoId = source == "youtube" ? item.YoutubeVideoId : null,
                Title = source == "youtube" ? yt?.Title ?? item.Title ?? $"Video {i + 1}" : item.Title ?? $"Video {i + 1}",
                Description = source == "youtube" ? yt?.Description ?? item.Description : item.Description,
                ThumbnailUrl = source == "youtube" ? yt?.ThumbnailUrl ?? ToMediaUrl(item.ThumbnailUrl) : ToMediaUrl(item.ThumbnailUrl),
                Url = source == "youtube"
                    ? !string.IsNullOrWhiteSpace(item.YoutubeVideoId)
                        ? $"https://www.youtube.com/watch?v={item.YoutubeVideoId}"
                        : ToMediaUrl(item.Url)
                    : ToMediaUrl(item.Url),
                DurationSeconds = source == "youtube" ? yt?.DurationSeconds ?? item.DurationSeconds ?? 0 : item.DurationSeconds ?? 0,
                Position = item.Position ?? i,
                PublishedAt = source == "youtube" ? yt?.PublishedAt ?? item.PublishedAt : item.PublishedAt
            });
        }

        return videos.OrderBy(v => v.Position).ToList();
    }

    private async Task<Dictionary<string, YouTubeVideoMetadata>> TryGetYouTubeMetadataAsync(List<string> youtubeIds)
    {
        try
        {
            return await youtube.GetVideoMetadataAsync(youtubeIds);
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to load YouTube metadata for offline import videos. Falling back to offline metadata.");
            return [];
        }
    }

    private string ResolvePathInOfflineRoot(string path)
    {
        var fullPath = Path.GetFullPath(Path.IsPathRooted(path) ? path : Path.Combine(_offlineDataRoot, path));
        var relative = Path.GetRelativePath(_offlineDataRoot, fullPath);
        if (relative.StartsWith("..", StringComparison.Ordinal) || Path.IsPathRooted(relative))
            throw new ArgumentException("offlineManifestPath must stay within the configured offline data root.");
        return fullPath;
    }

    private string? ToMediaUrl(string? path)
    {
        if (string.IsNullOrWhiteSpace(path)) return null;
        if (path.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith("https://", StringComparison.OrdinalIgnoreCase) ||
            path.StartsWith("/media/", StringComparison.OrdinalIgnoreCase))
            return path;

        var absolute = ResolvePathInOfflineRoot(path);
        var normalized = Path.GetRelativePath(_offlineDataRoot, absolute).Replace('\\', '/');

        return $"/media/{normalized.TrimStart('/')}";
    }

    private sealed class OfflinePlaylistManifest
    {
        public string? PlaylistMetadataSource { get; set; }
        public string? PlaylistUrl { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? ThumbnailUrl { get; set; }
        public DateTime? PublishedAt { get; set; }
        public OfflineChannelManifest? Channel { get; set; }
        public List<OfflineVideoManifest>? Videos { get; set; }
    }

    private sealed class OfflineChannelManifest
    {
        public string? YoutubeChannelId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? ThumbnailUrl { get; set; }
        public long? SubscriberCount { get; set; }
    }

    private sealed class OfflineVideoManifest
    {
        public string? MetadataSource { get; set; }
        public string? YoutubeVideoId { get; set; }
        public string? Title { get; set; }
        public string? Description { get; set; }
        public string? Url { get; set; }
        public string? ThumbnailUrl { get; set; }
        public int? DurationSeconds { get; set; }
        public int? Position { get; set; }
        public DateTime? PublishedAt { get; set; }
    }
}
