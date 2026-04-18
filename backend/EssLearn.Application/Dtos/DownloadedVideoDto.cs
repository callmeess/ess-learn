namespace EssLearn.Application.Dtos;

public record DownloadedVideoDto(int Id, string Quality, string Container, long FileSizeBytes, int? Width, int? Height, DateTime DownloadedAt);
