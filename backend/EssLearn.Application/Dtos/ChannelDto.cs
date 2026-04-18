namespace EssLearn.Application.Dtos;

// --- Channels ---
public record ChannelDto(int Id, string YoutubeChannelId, string Title, string? ThumbnailUrl, long SubscriberCount);
