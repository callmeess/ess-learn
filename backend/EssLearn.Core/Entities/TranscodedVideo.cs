namespace EssLearn.Core.Entities;

public class TranscodedVideo
{
    public int Id { get; set; }
    public int VideoId { get; set; }
    public int DownloadedVideoId { get; set; }

    /// <summary>
    /// MinIO path for the HLS manifest file (e.g., "hls/fields/1/playlists/1/1/master.m3u8")
    /// </summary>
    public string HlsManifestBlobPath { get; set; } = string.Empty;

    /// <summary>
    /// MinIO prefix for HLS segments (e.g., "hls/fields/1/playlists/1/1/segments/")
    /// </summary>
    public string HlsSegmentsBlobPath { get; set; } = string.Empty;

    public string BlobBucket { get; set; } = "esslearn-videos";
    public int SegmentCount { get; set; }
    public long TotalSizeBytes { get; set; }
    public DateTime TranscodedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Video Video { get; set; } = null!;
    public DownloadedVideo DownloadedVideo { get; set; } = null!;
}
