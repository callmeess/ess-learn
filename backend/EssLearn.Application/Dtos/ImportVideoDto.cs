namespace EssLearn.Application.Dtos;

public record ImportVideoDto(string VideoUrl, int FieldId, int? PlaylistId = null);
