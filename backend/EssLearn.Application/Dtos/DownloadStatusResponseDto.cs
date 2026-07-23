namespace EssLearn.Application.Dtos;

public record DownloadStatusResponseDto(bool IsDownloaded, DownloadedVideoDto? Download);
