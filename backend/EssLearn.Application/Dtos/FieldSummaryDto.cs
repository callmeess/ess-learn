namespace EssLearn.Application.Dtos;

public record FieldSummaryDto(int Id, string Name, string Color, int PlaylistCount, int VideoCount, int CompletedVideos, double Progress);
