namespace EssLearn.Core.Entities;

public enum TranscodeJobStatus
{
    Pending = 0,
    Transcoding = 1,
    Uploading = 2,
    Completed = 3,
    Failed = 4
}

public class TranscodeJob
{
    public int Id { get; set; }
    public int VideoId { get; set; }
    public int DownloadedVideoId { get; set; }
    public TranscodeJobStatus Status { get; set; } = TranscodeJobStatus.Pending;
    public double ProgressPercent { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public Video Video { get; set; } = null!;
    public DownloadedVideo DownloadedVideo { get; set; } = null!;
}
