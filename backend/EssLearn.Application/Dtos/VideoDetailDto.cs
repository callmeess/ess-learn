using EssLearn.Core.Enums;

namespace EssLearn.Application.Dtos;

public record VideoDetailDto(int Id, int PlaylistId, string? YoutubeVideoId, string Title, string? ThumbnailUrl, string? Url, int DurationSeconds, int Position, VideoStatus Status, int WatchedSeconds, bool IsDownloaded, DownloadedVideoDto? Download);
