namespace EssLearn.Core.Entities;

public class Video
{
    public int Id { get; set; }
    public int PlaylistId { get; set; }
    public string? YoutubeVideoId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Url { get; set; }
    public string? ThumbnailUrl { get; set; }
    public int DurationSeconds { get; set; }
    public int Position { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Playlist Playlist { get; set; } = null!;
    public VideoProgress? Progress { get; set; }
}
