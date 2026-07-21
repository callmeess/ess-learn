namespace EssLearn.Core.Entities;

public enum DownloadJobStatus
{
    Pending = 0,
    Downloading = 1,
    Uploading = 2,
    Completed = 3,
    Failed = 4
}

public class DownloadJob
{
    public int Id { get; set; }
    public int VideoId { get; set; }
    public string YoutubeVideoId { get; set; } = string.Empty;
    public string FormatId { get; set; } = string.Empty;
    public string Quality { get; set; } = string.Empty;
    public DownloadJobStatus Status { get; set; } = DownloadJobStatus.Pending;
    public double ProgressPercent { get; set; }
    public string? ErrorMessage { get; set; }
    public string? OutputPath { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public Video Video { get; set; } = null!;
}
