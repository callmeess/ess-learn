namespace EssLearn.Application.Dtos;

public record CreatePlaylistDto(string Title, int FieldId, string? Description, string? ThumbnailUrl, string? SourceUrl);