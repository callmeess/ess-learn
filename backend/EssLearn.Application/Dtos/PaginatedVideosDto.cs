namespace EssLearn.Application.Dtos;

public record PaginatedVideosDto(
    List<VideoListItemDto> Videos,
    int TotalCount,
    int Page,
    int PageSize,
    bool HasMore);
