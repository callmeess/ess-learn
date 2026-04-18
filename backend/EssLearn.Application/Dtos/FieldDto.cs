namespace EssLearn.Application.Dtos;

// --- Fields ---
public record FieldDto(int Id, string Name, string? Description, string Color, string? Icon, DateTime CreatedAt, int PlaylistCount, int VideoCount, int CompletedVideos, int TotalDurationSeconds, int WatchedSeconds);
