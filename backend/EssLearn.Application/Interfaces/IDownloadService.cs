using EssLearn.Application.Dtos;

namespace EssLearn.Application.Interfaces;

public interface IDownloadService
{
    Task<List<VideoFormatDto>> GetFormatsAsync(int videoId);
    Task<DownloadedVideoDto> DownloadVideoAsync(int videoId, DownloadVideoDto dto);
    Task DeleteDownloadAsync(int videoId);
    Task<DownloadStatusResponseDto> GetDownloadStatusAsync(int videoId);
    Task<DownloadProgressResponseDto> GetDownloadProgressAsync(int videoId);
}
