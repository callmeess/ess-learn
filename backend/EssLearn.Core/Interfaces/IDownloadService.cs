using EssLearn.Api.Dtos;

namespace EssLearn.Core.Interfaces;

/// <summary>
/// Service for managing video downloads.
/// </summary>
public interface IDownloadService
{
    /// <summary>
    /// Gets available video formats for a video.
    /// </summary>
    Task<List<VideoFormatDto>> GetFormatsAsync(int videoId);

    /// <summary>
    /// Downloads a video in the specified format.
    /// </summary>
    Task<DownloadedVideoDto> DownloadVideoAsync(int videoId, DownloadVideoDto dto);

    /// <summary>
    /// Deletes a downloaded video file and removes the record.
    /// </summary>
    Task DeleteDownloadAsync(int videoId);

    /// <summary>
    /// Gets the download status of a video.
    /// </summary>
    Task<object> GetDownloadStatusAsync(int videoId);
}
