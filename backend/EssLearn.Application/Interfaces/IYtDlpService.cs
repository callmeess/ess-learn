using EssLearn.Core.Dtos;

namespace EssLearn.Core.Interfaces.YtDlp;

/// <summary>
/// Low-level yt-dlp service interface for executing commands
/// </summary>
public interface IYtDlpService
{
    Task<VideoMetadataDto> GetMetadataAsync(string url, CancellationToken ct = default);

    Task<List<VideoFormatInfo>> GetAvailableFormatsAsync(string youtubeVideoId, CancellationToken ct = default);

    Task<List<VideoMetadataDto>> GetPlaylistEntriesAsync(string playlistUrl, CancellationToken ct = default);

    Task<string> DownloadAsync(
        DownloadRequestDto request,
        IProgress<DownloadProgressDto>? progress = null,
        CancellationToken ct = default);

    Task<string> RunAsync(
        string[] args,
        CancellationToken ct = default,
        IProgress<DownloadProgressDto>? progress = null);
}

public record VideoFormatInfo(
    string FormatId,
    string Quality,
    string Container,
    long FileSizeBytes,
    int? Width,
    int? Height,
    string? VideoCodec,
    string? AudioCodec,
    bool HasVideo,
    bool HasAudio
);

public record DownloadResult(
    bool Success,
    string? FilePath,
    long FileSizeBytes,
    string? ErrorMessage
);
