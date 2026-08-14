namespace EssLearn.Application.Dtos;

public record AddVideosToPlaylistDto(IReadOnlyList<int> VideoIds);