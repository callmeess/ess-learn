namespace EssLearn.Application.Dtos;

public record UpdatePlaylistDto(string Title, int? FieldId, string? Description, string? ThumbnailUrl, string? SourceUrl);