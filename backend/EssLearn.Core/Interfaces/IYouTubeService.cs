using EssLearn.Core.Entities;

namespace EssLearn.Core.Interfaces;

public record YouTubeVideoMetadata(string VideoId, string Title, string? Description, string? ThumbnailUrl, int DurationSeconds, DateTime? PublishedAt);

public interface IYouTubeService
{
    Task<(Playlist Playlist, Channel Channel, List<Video> Videos)> ImportPlaylistAsync(string playlistUrl, int fieldId);
    Task<Dictionary<string, YouTubeVideoMetadata>> GetVideoMetadataAsync(List<string> videoIds);
}
