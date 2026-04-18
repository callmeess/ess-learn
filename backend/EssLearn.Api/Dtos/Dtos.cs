using EssLearn.Core.Enums;

namespace EssLearn.Api.Dtos;

// --- Fields ---
public record FieldDto(int Id, string Name, string? Description, string Color, string? Icon, DateTime CreatedAt, int PlaylistCount, int VideoCount, int CompletedVideos, int TotalDurationSeconds, int WatchedSeconds);
public record CreateFieldDto(string Name, string? Description, string? Color, string? Icon);
public record UpdateFieldDto(string Name, string? Description, string? Color, string? Icon);

// --- Channels ---
public record ChannelDto(int Id, string YoutubeChannelId, string Title, string? ThumbnailUrl, long SubscriberCount);

// --- Playlists ---
public record PlaylistDto(int Id, int FieldId, string Title, string? Description, string? ThumbnailUrl, string? SourceUrl, int TotalVideos, int CompletedVideos, int TotalDurationSeconds, int WatchedSeconds, string? ChannelTitle, DateTime CreatedAt);
public record PlaylistDetailDto(PlaylistDto Playlist, List<VideoDto> Videos);

// --- Videos ---
public record VideoListItemDto(int Id, int PlaylistId, int FieldId, string Title, string? ThumbnailUrl, string? Url, int DurationSeconds, int Position, VideoStatus Status, int WatchedSeconds, string PlaylistTitle, string? ChannelTitle, bool IsDownloaded, DateTime? PublishedAt, DateTime CreatedAt);
public record VideoDto(int Id, int PlaylistId, string? YoutubeVideoId, string Title, string? ThumbnailUrl, string? Url, int DurationSeconds, int Position, VideoStatus Status, int WatchedSeconds);
public record VideoDetailDto(int Id, int PlaylistId, string? YoutubeVideoId, string Title, string? ThumbnailUrl, string? Url, int DurationSeconds, int Position, VideoStatus Status, int WatchedSeconds, bool IsDownloaded, DownloadedVideoDto? Download);

// --- Downloads ---
public record VideoFormatDto(string FormatId, string Quality, string Container, long FileSizeBytes, string FileSizeFormatted, int? Width, int? Height, string? VideoCodec, string? AudioCodec);
public record DownloadVideoDto(string FormatId, string Quality);
public record DownloadedVideoDto(int Id, string Quality, string Container, long FileSizeBytes, int? Width, int? Height, DateTime DownloadedAt);

// --- Progress ---
public record UpdateProgressDto(int WatchedSeconds, VideoStatus Status);
public record ProgressDto(int VideoId, VideoStatus Status, int WatchedSeconds, DateTime? LastWatchedAt, DateTime? CompletedAt);

// --- YouTube Import ---
public record ImportPlaylistDto(string PlaylistUrl, int FieldId);
public record ImportResultDto(int PlaylistId, string Title, int VideosImported, string ChannelTitle);

// --- Dashboard ---
public record DashboardDto(int TotalFields, int TotalPlaylists, int TotalVideos, int CompletedVideos, int TotalDurationSeconds, int WatchedSeconds, double OverallProgress, List<FieldSummaryDto> Fields, List<RecentVideoDto> RecentlyWatched);
public record FieldSummaryDto(int Id, string Name, string Color, int PlaylistCount, int VideoCount, int CompletedVideos, double Progress);
public record RecentVideoDto(int VideoId, string Title, string? ThumbnailUrl, string PlaylistTitle, int WatchedSeconds, int DurationSeconds, DateTime LastWatchedAt);
