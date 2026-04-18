using EssLearn.Application.Dtos;

namespace EssLearn.Core.Interfaces;

public interface IDownloadService
{
    Task<List<VideoFormatDto>> GetFormatsAsync(int videoId);
    Task<DownloadedVideoDto> DownloadVideoAsync(int videoId, DownloadVideoDto dto);
    Task DeleteDownloadAsync(int videoId);
    Task<object> GetDownloadStatusAsync(int videoId);
}
