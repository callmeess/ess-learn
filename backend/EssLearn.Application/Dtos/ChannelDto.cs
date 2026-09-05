namespace EssLearn.Application.Dtos;

// --- Channels ---
public record ChannelDto(int Id, string YoutubeChannelId, string Title, string? ThumbnailUrl, long SubscriberCount);

public record ChannelListItemDto(
    int Id,
    string Title,
    string? ThumbnailUrl,
    long SubscriberCount,
    int VideoCount,
    int DownloadedCount,
    int WatchedCount,
    int TotalDurationSeconds,
    int WatchedSeconds
);
