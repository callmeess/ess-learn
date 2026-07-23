using EssLearn.Application.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Enums;

namespace EssLearn.Application.Mappings;

public static class VideoMappingExtensions
{
    public static VideoListItemDto ToListItemDto(this Video v) => new(
        v.Id,
        v.PlaylistId,
        v.Playlist.FieldId,
        v.Title,
        v.ThumbnailUrl,
        v.Url,
        v.DurationSeconds,
        v.Position,
        v.Progress?.Status ?? VideoStatus.NotStarted,
        v.Progress?.WatchedSeconds ?? 0,
        v.Playlist.Title,
        v.Playlist.Channel?.Title,
        v.DownloadedVideo is not null,
        v.PublishedAt,
        v.CreatedAt
    );

    public static VideoDto ToDto(this Video v) => new(
        v.Id, v.PlaylistId, v.YoutubeVideoId, v.Title, v.ThumbnailUrl, v.Url,
        v.DurationSeconds, v.Position,
        v.Progress?.Status ?? VideoStatus.NotStarted,
        v.Progress?.WatchedSeconds ?? 0
    );

    public static ProgressDto ToDto(this VideoProgress p) => new(
        p.VideoId, p.Status, p.WatchedSeconds, p.LastWatchedAt, p.CompletedAt
    );
}
