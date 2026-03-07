using EssLearn.Core.Entities;

namespace EssLearn.Core.Interfaces;

public interface IYouTubeService
{
    Task<(Playlist Playlist, Channel Channel, List<Video> Videos)> ImportPlaylistAsync(string playlistUrl, int fieldId);
}
