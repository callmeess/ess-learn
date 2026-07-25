namespace EssLearn.Application.Dtos;

public record DownloadProgressResponseDto(
    bool HasActiveJob,
    int? JobId,
    string? Status,
    double Progress,
    string? ErrorMessage,
    DateTime? CreatedAt,
    DateTime? CompletedAt);
