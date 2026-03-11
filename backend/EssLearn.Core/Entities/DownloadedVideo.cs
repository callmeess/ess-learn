namespace EssLearn.Core.Entities;

public class DownloadedVideo
{
    public int Id { get; set; }
    public int VideoId { get; set; }
    public string FilePath { get; set; } = string.Empty;
    public string Quality { get; set; } = string.Empty; // e.g., "1080p", "720p", "480p"
    public string FormatId { get; set; } = string.Empty; // yt-dlp format ID
    public long FileSizeBytes { get; set; }
    public string Container { get; set; } = string.Empty; // e.g., "mp4", "webm"
    public int? Width { get; set; }
    public int? Height { get; set; }
    public string? VideoCodec { get; set; }
    public string? AudioCodec { get; set; }
    public DateTime DownloadedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Video Video { get; set; } = null!;
}
