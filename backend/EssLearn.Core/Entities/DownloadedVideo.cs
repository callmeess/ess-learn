namespace EssLearn.Core.Entities;

public class DownloadedVideo
{
    public int Id { get; set; }
    public int PublicVideoId { get; set; }
    
    public string Quality { get; set; } = string.Empty; // e.g., "1080p", "720p", "480p"
    public string FormatId { get; set; } = string.Empty; // yt-dlp format ID
    public long FileSizeBytes { get; set; }
    public string Container { get; set; } = string.Empty; // e.g., "mp4", "webm"
    public int? Width { get; set; }
    public int? Height { get; set; }
    public string? VideoCodec { get; set; }
    public string? AudioCodec { get; set; }
    
    // Blob Storage Fields (NEW)
    /// <summary>
    /// MinIO object path (e.g., "videos/fields/1/playlists/1/1/video.mp4")
    /// </summary>
    public string? BlobPath { get; set; }
    
    /// <summary>
    /// MinIO bucket name (e.g., "esslearn-videos")
    /// </summary>
    public string BlobBucket { get; set; } = "esslearn-videos";
    
    /// <summary>
    /// SHA256 hash of the blob for integrity verification
    /// </summary>
    public string? Sha256Hash { get; set; }
    
    /// <summary>
    /// Timestamp when blob was stored in MinIO
    /// </summary>
    public DateTime? BlobStoredAt { get; set; }
    
    public DateTime DownloadedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Video Video { get; set; } = null!;
    
    // Navigation property
    public StorageIntegrity? StorageIntegrity { get; set; }
}
