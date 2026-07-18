namespace EssLearn.Application.Services.BlobStorage;


public static class BlobPathBuilder
{
    
    public static string VideoPath(int fieldId, int playlistId, int videoId, string extension)
    {
        return $"videos/fields/{fieldId}/playlists/{playlistId}/{videoId}/video.{extension}";
    }

    public static string VideoMetadataPath(int fieldId, int playlistId, int videoId)
    {
        return $"videos/fields/{fieldId}/playlists/{playlistId}/{videoId}/metadata.json";
    }

    
    public static string VideoThumbnailPath(int fieldId, int playlistId, int videoId, string variant = "default")
    {
        return $"videos/fields/{fieldId}/playlists/{playlistId}/{videoId}/thumbnails/{variant}.jpg";
    }

    
    public static string PlaylistCoverPath(int playlistId)
    {
        return $"images/playlists/{playlistId}/cover.jpg";
    }

    public static string FieldCoverPath(int fieldId)
    {
        return $"images/fields/{fieldId}/cover.jpg";
    }

    public static string FieldIconPath(int fieldId)
    {
        return $"icons/fields/{fieldId}.svg";
    }

    
    public static string CategoryIconPath(int categoryId)
    {
        return $"icons/categories/{categoryId}.svg";
    }

    public static string OrphanedPath(string originalPath, int orphanedAtUnixTime)
    {
        return $"orphaned/{orphanedAtUnixTime}/{originalPath}";
    }

    
    public static string TempPath(string sessionId, string fileName)
    {
        return $"uploads/{sessionId}/{fileName}";
    }

    public static int? ExtractFieldIdFromVideoPath(string path)
    {
        // Path: videos/fields/{fieldId}/...
        var parts = path.Split('/');
        if (parts.Length > 2 && parts[0] == "videos" && parts[1] == "fields" && int.TryParse(parts[2], out var id))
        {
            return id;
        }
        return null;
    }

    
    public static int? ExtractPlaylistIdFromVideoPath(string path)
    {
        // Path: videos/fields/{fieldId}/playlists/{playlistId}/...
        var parts = path.Split('/');
        if (parts.Length > 4 && parts[3] == "playlists" && int.TryParse(parts[4], out var id))
        {
            return id;
        }
        return null;
    }

    /// <summary>
    /// Extracts video ID from a video path.
    /// </summary>
    public static int? ExtractVideoIdFromVideoPath(string path)
    {
        // Path: videos/fields/{fieldId}/playlists/{playlistId}/{videoId}/...
        var parts = path.Split('/');
        if (parts.Length > 5 && int.TryParse(parts[5], out var id))
        {
            return id;
        }
        return null;
    }
}
