using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;

namespace EssLearn.Infrastructure.Services;

public class UnavailableYouTubeService : IYouTubeService
{
    public Task<(Playlist Playlist, Channel Channel, List<Video> Videos)> ImportPlaylistAsync(string playlistUrl, int fieldId)
        => throw new InvalidOperationException("YouTube API key is not configured. Configure YouTube:ApiKey to import online metadata.");

    public Task<Dictionary<string, YouTubeVideoMetadata>> GetVideoMetadataAsync(List<string> videoIds)
        => throw new InvalidOperationException("YouTube API key is not configured. Configure YouTube:ApiKey to load online video metadata.");
}
