using EssLearn.Application.Dtos.BlobStorage;

namespace EssLearn.Core.Interfaces;

/// <summary>
/// Service for managing blob storage operations in MinIO.
/// Provides unified interface for uploading, downloading, verifying, and managing blobs.
/// </summary>
public interface IBlobStorageService
{
    /// <summary>
    /// Uploads a file to blob storage with integrity verification.
    /// </summary>
    /// <param name="bucket">Target bucket name</param>
    /// <param name="objectPath">Object path in bucket (e.g., "videos/field1/playlist1/video1/video.mp4")</param>
    /// <param name="fileStream">File content stream</param>
    /// <param name="fileSize">File size in bytes</param>
    /// <param name="contentType">MIME type (e.g., "video/mp4")</param>
    /// <param name="sha256Hash">Optional pre-calculated SHA256 hash for verification</param>
    /// <returns>Upload result with blob metadata and integrity info</returns>
    Task<BlobStorageResult> UploadFileAsync(
        string bucket,
        string objectPath,
        Stream fileStream,
        long fileSize,
        string contentType,
        string? sha256Hash = null);

    /// <summary>
    /// Verifies integrity of a blob in storage.
    /// Compares stored hash and size with expected values.
    /// </summary>
    Task<BlobStorageResult> VerifyIntegrityAsync(
        string bucket,
        string objectPath,
        string expectedSha256,
        long expectedSize);

    /// <summary>
    /// Downloads a blob from storage.
    /// </summary>
    Task<Stream> DownloadFileAsync(string bucket, string objectPath);

    /// <summary>
    /// Gets metadata about a blob without downloading content.
    /// </summary>
    Task<BlobStorageMetadata> GetMetadataAsync(string bucket, string objectPath);

    /// <summary>
    /// Copies a blob from source to destination.
    /// </summary>
    Task<BlobStorageResult> CopyBlobAsync(
        string sourceBucket,
        string sourceObjectPath,
        string destBucket,
        string destObjectPath);

    /// <summary>
    /// Deletes a blob from storage.
    /// </summary>
    Task<BlobStorageResult> DeleteBlobAsync(string bucket, string objectPath);

    /// <summary>
    /// Moves a blob to the orphaned folder (soft delete).
    /// Allows recovery if deletion was accidental.
    /// </summary>
    Task<BlobStorageResult> MoveToOrphanedAsync(string bucket, string objectPath);

    /// <summary>
    /// Lists all blobs in a bucket with optional prefix.
    /// </summary>
    Task<List<BlobMetadata>> ListBlobsAsync(string bucket, string prefix = "");

    /// <summary>
    /// Checks if a blob exists in storage.
    /// </summary>
    Task<bool> BlobExistsAsync(string bucket, string objectPath);
}
