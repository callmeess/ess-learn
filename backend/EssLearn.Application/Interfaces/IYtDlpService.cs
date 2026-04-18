using EssLearn.Core.Dtos;

namespace EssLearn.Core.Interfaces.YtDlp;

/// <summary>
/// Low-level yt-dlp service interface for executing commands
/// Implemented in Infrastructure layer as YtDlpService
/// </summary>
public interface IYtDlpService
{

    Task<VideoMetadataDto> GetMetadataAsync(string url, CancellationToken ct = default);

    Task<string> DownloadAsync(
        DownloadRequestDto request,
        IProgress<DownloadProgressDto>? progress = null,
        CancellationToken ct = default);

    Task<string> RunAsync(
        string[] args,
        CancellationToken ct = default,
        IProgress<DownloadProgressDto>? progress = null);
}