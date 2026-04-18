namespace EssLearn.Application.Dtos;

// --- Downloads ---
public record VideoFormatDto(string FormatId, string Quality, string Container, long FileSizeBytes, string FileSizeFormatted, int? Width, int? Height, string? VideoCodec, string? AudioCodec);
