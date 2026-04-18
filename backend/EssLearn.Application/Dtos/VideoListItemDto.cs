using EssLearn.Core.Enums;

namespace EssLearn.Application.Dtos;

public record VideoListItemDto(int Id, int PlaylistId, int FieldId, string Title, string? ThumbnailUrl, string? Url, int DurationSeconds, int Position, VideoStatus Status, int WatchedSeconds, string PlaylistTitle, string? ChannelTitle, bool IsDownloaded, DateTime? PublishedAt, DateTime CreatedAt);
