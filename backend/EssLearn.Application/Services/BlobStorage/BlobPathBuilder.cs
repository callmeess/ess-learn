namespace EssLearn.Application.Services.BlobStorage;

/// <summary>
/// Path builder for organizing blobs in MinIO with consistent hierarchy.
/// </summary>
public static class BlobPathBuilder
{
    /// <summary>
    /// Builds path for a video file.
    /// Format: videos/fields/{fieldId}/playlists/{playlistId}/{videoId}/video.{ext}
    /// </summary>
    public static string VideoPath(int fieldId, int playlistId, int videoId, string extension)
    {
        return $"videos/fields/{fieldId}/playlists/{playlistId}/{videoId}/video.{extension}";
    }

    /// <summary>
    /// Builds path for video metadata JSON.
    /// </summary>
    public static string VideoMetadataPath(int fieldId, int playlistId, int videoId)
    {
        return $"videos/fields/{fieldId}/playlists/{playlistId}/{videoId}/metadata.json";
    }

    /// <summary>
    /// Builds path for video thumbnail.
    /// </summary>
    public static string VideoThumbnailPath(int fieldId, int playlistId, int videoId, string variant = "default")
    {
        return $"videos/fields/{fieldId}/playlists/{playlistId}/{videoId}/thumbnails/{variant}.jpg";
    }

    /// <summary>
    /// Builds path for playlist cover image.
    /// </summary>
    public static string PlaylistCoverPath(int playlistId)
    {
        return $"images/playlists/{playlistId}/cover.jpg";
    }

    /// <summary>
    /// Builds path for field cover image.
    /// </summary>
    public static string FieldCoverPath(int fieldId)
    {
        return $"images/fields/{fieldId}/cover.jpg";
    }

    /// <summary>
    /// Builds path for field icon.
    /// </summary>
    public static string FieldIconPath(int fieldId)
    {
        return $"icons/fields/{fieldId}.svg";
    }

    /// <summary>
    /// Builds path for category icon.
    /// </summary>
    public static string CategoryIconPath(int categoryId)
    {
        return $"icons/categories/{categoryId}.svg";
    }

    /// <summary>
    /// Builds path for orphaned blob (soft delete).
    /// </summary>
    public static string OrphanedPath(string originalPath, int orphanedAtUnixTime)
    {
        return $"orphaned/{orphanedAtUnixTime}/{originalPath}";
    }

    /// <summary>
    /// Builds path for temporary upload.
    /// </summary>
    public static string TempPath(string sessionId, string fileName)
    {
        return $"uploads/{sessionId}/{fileName}";
    }

    /// <summary>
    /// Extracts field ID from a video path.
    /// </summary>
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

    /// <summary>
    /// Extracts playlist ID from a video path.
    /// </summary>
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
