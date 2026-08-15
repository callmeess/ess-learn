namespace EssLearn.Application.Dtos;

public record FieldSummaryDto(int Id, string Name, string Color, int PlaylistCount, int VideoCount, int WatchedVideos, int CompletedVideos, long TotalDurationSeconds, long WatchedSeconds, double Progress);
