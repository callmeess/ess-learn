using EssLearn.Application.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Enums;

namespace EssLearn.Application.Mappings;

public static class PlaylistMappingExtensions
{
    public static PlaylistDto ToDto(this Playlist p)
    {
        var videos = p.Videos.ToList();
        return new PlaylistDto(
            p.Id, p.FieldId, p.Title, p.Description, p.ThumbnailUrl, p.SourceUrl,
            videos.Count,
            videos.Count(v => v.Progress?.Status == VideoStatus.Completed),
            videos.Sum(v => v.DurationSeconds),
            videos.Sum(v => v.Progress?.WatchedSeconds ?? 0),
            p.Channel?.Title,
            p.CreatedAt
        );
    }

    public static PlaylistDetailDto ToDetailDto(this Playlist p)
    {
        var videoDtos = p.Videos.Select(v => v.ToDto()).ToList();
        return new PlaylistDetailDto(p.ToDto(), videoDtos);
    }
}
