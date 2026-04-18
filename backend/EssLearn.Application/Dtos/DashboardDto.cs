namespace EssLearn.Application.Dtos;

public record DashboardDto(int TotalFields, int TotalPlaylists, int TotalVideos, int CompletedVideos, int TotalDurationSeconds, int WatchedSeconds, double OverallProgress, List<FieldSummaryDto> Fields, List<RecentVideoDto> RecentlyWatched);
