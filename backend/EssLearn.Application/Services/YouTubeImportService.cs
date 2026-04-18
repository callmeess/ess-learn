using System.Text.RegularExpressions;
using System.Xml;
using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
using Google.Apis.Services;
using Google.Apis.YouTube.v3;

namespace EssLearn.Infrastructure.Services;

public partial class YouTubeImportService : IYouTubeService
{
    private readonly YouTubeService _youtube;

    public YouTubeImportService(string apiKey)
    {
        _youtube = new YouTubeService(new BaseClientService.Initializer
        {
            ApiKey = apiKey,
            ApplicationName = "EssLearn"
        });
    }

    public async Task<(Playlist Playlist, Channel Channel, List<Video> Videos)> ImportPlaylistAsync(string playlistUrl, int fieldId)
    {
        var playlistId = ExtractPlaylistId(playlistUrl)
            ?? throw new ArgumentException("Invalid YouTube playlist URL.");

        // Fetch playlist metadata
        var plReq = _youtube.Playlists.List("snippet,contentDetails");
        plReq.Id = playlistId;
        var plResp = await plReq.ExecuteAsync();
        var plItem = plResp.Items.FirstOrDefault()
            ?? throw new ArgumentException("Playlist not found on YouTube.");

        // Fetch channel metadata
        var chReq = _youtube.Channels.List("snippet,statistics");
        chReq.Id = plItem.Snippet.ChannelId;
        var chResp = await chReq.ExecuteAsync();
        var chItem = chResp.Items.FirstOrDefault();

        var channel = new Channel
        {
            YoutubeChannelId = plItem.Snippet.ChannelId,
            Title = chItem?.Snippet?.Title ?? "Unknown Channel",
            Description = chItem?.Snippet?.Description,
            ThumbnailUrl = chItem?.Snippet?.Thumbnails?.Medium?.Url,
            SubscriberCount = (long)(chItem?.Statistics?.SubscriberCount ?? 0)
        };

        var playlist = new Playlist
        {
            FieldId = fieldId,
            YoutubePlaylistId = playlistId,
            Title = plItem.Snippet.Title,
            Description = plItem.Snippet.Description,
            ThumbnailUrl = plItem.Snippet.Thumbnails?.High?.Url ?? plItem.Snippet.Thumbnails?.Medium?.Url,
            SourceUrl = playlistUrl,
            TotalVideos = (int)(plItem.ContentDetails?.ItemCount ?? 0),
            PublishedAt = plItem.Snippet.PublishedAtDateTimeOffset?.UtcDateTime
        };

        // Fetch all videos in the playlist
        var videos = new List<Video>();
        string? nextPageToken = null;
        var position = 0;

        do
        {
            var viReq = _youtube.PlaylistItems.List("snippet,contentDetails");
            viReq.PlaylistId = playlistId;
            viReq.MaxResults = 50;
            viReq.PageToken = nextPageToken;
            var viResp = await viReq.ExecuteAsync();

            var videoIds = viResp.Items
                .Select(i => i.ContentDetails.VideoId)
                .Where(id => !string.IsNullOrEmpty(id))
                .ToList();

            // Batch fetch durations
            var durations = await GetVideoDurationsAsync(videoIds);

            foreach (var item in viResp.Items)
            {
                var vid = item.ContentDetails.VideoId;
                if (string.IsNullOrEmpty(vid)) continue;

                videos.Add(new Video
                {
                    YoutubeVideoId = vid,
                    Title = item.Snippet.Title,
                    Description = item.Snippet.Description,
                    Url = $"https://www.youtube.com/watch?v={vid}",
                    ThumbnailUrl = item.Snippet.Thumbnails?.Medium?.Url ?? item.Snippet.Thumbnails?.Default__?.Url,
                    DurationSeconds = durations.GetValueOrDefault(vid, 0),
                    Position = position++,
                    PublishedAt = item.Snippet.PublishedAtDateTimeOffset?.UtcDateTime
                });
            }

            nextPageToken = viResp.NextPageToken;
        } while (!string.IsNullOrEmpty(nextPageToken));

        playlist.TotalVideos = videos.Count;
        return (playlist, channel, videos);
    }

    private async Task<Dictionary<string, int>> GetVideoDurationsAsync(List<string> videoIds)
    {
        if (videoIds.Count == 0) return [];

        var req = _youtube.Videos.List("contentDetails");
        req.Id = string.Join(",", videoIds);
        var resp = await req.ExecuteAsync();

        return resp.Items.ToDictionary(
            v => v.Id,
            v => (int)XmlConvert.ToTimeSpan(v.ContentDetails.Duration).TotalSeconds
        );
    }

    private static string? ExtractPlaylistId(string url)
    {
        // Handle direct playlist ID
        if (!url.Contains('/') && !url.Contains('?'))
            return url;

        var match = PlaylistIdRegex().Match(url);
        return match.Success ? match.Groups[1].Value : null;
    }

    [GeneratedRegex(@"[?&]list=([a-zA-Z0-9_-]+)")]
    private static partial Regex PlaylistIdRegex();
}
