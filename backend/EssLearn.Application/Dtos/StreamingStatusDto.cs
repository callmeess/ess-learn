namespace EssLearn.Application.Dtos;

public record StreamingStatusDto(
    bool IsTranscoded,
    bool IsTranscoding,
    double ProgressPercent,
    string? HlsManifestUrl);
