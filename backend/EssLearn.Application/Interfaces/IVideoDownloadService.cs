namespace EssLearn.Core.Interfaces;

public interface IVideoDownloadService
{
    Task<List<VideoFormatInfo>> GetAvailableFormatsAsync(string youtubeVideoId);
    Task<DownloadResult> DownloadVideoAsync(string youtubeVideoId, string formatId, string quality);
    string GetVideoPath(int videoId, string quality);
    bool IsVideoDownloaded(int videoId);
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
