using EssLearn.Application.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Enums;

namespace EssLearn.Application.Mappings;

public static class FieldMappingExtensions
{
    public static FieldDto ToDto(this LearningField f)
    {
        var videos = f.Playlists.SelectMany(p => p.Videos).ToList();
        return new FieldDto(
            f.Id, f.Name, f.Description, f.Color, f.Icon, f.CreatedAt,
            f.Playlists.Count,
            videos.Count,
            videos.Count(v => v.Progress?.Status == VideoStatus.Completed),
            videos.Sum(v => v.DurationSeconds),
            videos.Sum(v => v.Progress?.WatchedSeconds ?? 0)
        );
    }

    public static FieldSummaryDto ToSummaryDto(this LearningField f)
    {
        var videos = f.Playlists.SelectMany(p => p.Videos).ToList();
        var completed = videos.Count(v => v.Progress?.Status == VideoStatus.Completed);
        return new FieldSummaryDto(
            f.Id, f.Name, f.Color,
            f.Playlists.Count,
            videos.Count,
            completed,
            videos.Count > 0 ? Math.Round((double)completed / videos.Count * 100, 1) : 0
        );
    }
}
