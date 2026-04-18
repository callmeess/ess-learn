namespace EssLearn.Core.Dtos;

/// <summary>
/// Real-time progress update during download
/// </summary>
public record DownloadProgressDto(
    double PercentComplete,
    string SizeDownloaded,
    string DownloadSpeed,
    string EstimatedTime
);
