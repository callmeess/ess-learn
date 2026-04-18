namespace EssLearn.Application.Dtos;

// --- Playlists ---
public record PlaylistDto(int Id, int FieldId, string Title, string? Description, string? ThumbnailUrl, string? SourceUrl, int TotalVideos, int CompletedVideos, int TotalDurationSeconds, int WatchedSeconds, string? ChannelTitle, DateTime CreatedAt);
