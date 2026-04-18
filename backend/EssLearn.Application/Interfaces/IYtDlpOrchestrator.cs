using EssLearn.Core.Dtos;

namespace EssLearn.Application.Interfaces.YtDlp;

/// <summary>
/// High-level orchestration interface for yt-dlp operations
/// Bridges application/business logic with infrastructure services
/// Registered as Scoped - can be injected into controllers and services
/// </summary>
public interface IYtDlpOrchestrator
{
    Task<VideoMetadataDto> GetVideoMetadataAsync(string url, CancellationToken ct = default);
    Task<string> DownloadVideoAsync(
        DownloadRequestDto request,
        IProgress<DownloadProgressDto>? progress = null,
        CancellationToken ct = default);
}
