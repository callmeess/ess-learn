namespace EssLearn.Application.Dtos;

public record RecentVideoDto(int VideoId, string Title, string? ThumbnailUrl, string PlaylistTitle, int WatchedSeconds, int DurationSeconds, DateTime LastWatchedAt);
