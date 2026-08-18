namespace EssLearn.Application.Dtos;

public record DashboardDto(int TotalFields,
        int TotalPlaylists,
        int TotalVideos,
        int WatchedVideos,
        int CompletedVideos,
        long TotalDurationSeconds,
        long WatchedSeconds,
        double OverallProgress,
        List<FieldSummaryDto> Fields,
       List<RecentVideoDto> RecentlyWatched);
