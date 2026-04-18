namespace EssLearn.Core.Entities;

/// <summary>
/// Tracks integrity verification status of blobs in storage.
/// Ensures database records match actual blob data in MinIO.
/// </summary>
public class StorageIntegrity
{
    public int Id { get; set; }

    /// <summary>
    /// Object path in MinIO bucket (e.g., "videos/fields/1/playlists/1/1/video.mp4")
    /// </summary>
    public string BlobPath { get; set; } = string.Empty;

    /// <summary>
    /// MinIO bucket name (e.g., "esslearn-videos")
    /// </summary>
    public string BlobBucket { get; set; } = string.Empty;

    /// <summary>
    /// SHA256 hash of the blob for integrity verification
    /// </summary>
    public string Sha256Hash { get; set; } = string.Empty;

    /// <summary>
    /// Expected file size in bytes when uploaded
    /// </summary>
    public long ExpectedSize { get; set; }

    /// <summary>
    /// Actual file size in MinIO (may differ if corruption occurred)
    /// </summary>
    public long ActualSize { get; set; }

    /// <summary>
    /// Whether the blob has passed all integrity checks
    /// </summary>
    public bool IsValid { get; set; } = true;

    /// <summary>
    /// Last time this integrity check was performed
    /// </summary>
    public DateTime CheckedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Error message if integrity check failed (null if valid)
    /// </summary>
    public string? ErrorMessage { get; set; }

    // Foreign keys for referential integrity
    public int? DownloadedVideoId { get; set; }

    // Navigation properties
    public DownloadedVideo? DownloadedVideo { get; set; }
}
