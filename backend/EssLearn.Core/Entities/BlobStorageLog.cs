namespace EssLearn.Core.Entities;

/// <summary>
/// Audit log for all blob storage operations.
/// Provides traceability and debugging capability for blob operations.
/// </summary>
public class BlobStorageLog
{
    public int Id { get; set; }

    /// <summary>
    /// Operation type: Upload, Download, Delete, Copy, Verify, Move, etc.
    /// </summary>
    public string Operation { get; set; } = string.Empty;

    /// <summary>
    /// Object path in MinIO bucket
    /// </summary>
    public string BlobPath { get; set; } = string.Empty;

    /// <summary>
    /// MinIO bucket name
    /// </summary>
    public string BlobBucket { get; set; } = string.Empty;

    /// <summary>
    /// Whether the operation succeeded
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Error message if operation failed (null if successful)
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// Timestamp when operation was executed
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Additional metadata as JSON (e.g., file size, hash, duration, etc.)
    /// </summary>
    public string? Metadata { get; set; }
}
