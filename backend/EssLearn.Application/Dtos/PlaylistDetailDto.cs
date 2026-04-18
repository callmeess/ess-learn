namespace EssLearn.Application.Dtos;

public record PlaylistDetailDto(PlaylistDto Playlist, List<VideoDto> Videos);
