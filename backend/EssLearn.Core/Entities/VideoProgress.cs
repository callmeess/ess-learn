using EssLearn.Core.Enums;

namespace EssLearn.Core.Entities;

public class VideoProgress
{
    public int Id { get; set; }
    public int VideoId { get; set; }
    public VideoStatus Status { get; set; } = VideoStatus.NotStarted;
    public int WatchedSeconds { get; set; }
    public DateTime? LastWatchedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Video Video { get; set; } = null!;
}
