namespace EssLearn.Application.Dtos.BlobStorage;

/// <summary>
/// Result of a blob storage operation.
/// </summary>
public class BlobStorageResult
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public BlobStorageMetadata? Metadata { get; set; }
    public string? BlobPath { get; set; }              // Object path in bucket
    public string? Sha256Hash { get; set; }
    public long FileSizeBytes { get; set; }
    public DateTime OperationTime { get; set; } = DateTime.UtcNow;

    public static BlobStorageResult SuccessResult(BlobStorageMetadata metadata, string blobPath, string sha256)
        => new()
        {
            Success = true,
            Metadata = metadata,
            BlobPath = blobPath,
            Sha256Hash = sha256,
            FileSizeBytes = metadata.Size
        };

    public static BlobStorageResult FailResult(string errorMessage)
        => new()
        {
            Success = false,
            ErrorMessage = errorMessage
        };
}

/// <summary>
/// Metadata about a blob in storage.
/// </summary>
public class BlobStorageMetadata
{
    public string Name { get; set; } = string.Empty;           // Object name
    public long Size { get; set; }
    public DateTime LastModified { get; set; }
    public string? ETag { get; set; }                           // MinIO ETag
    public string? ContentType { get; set; }
    public Dictionary<string, string>? Tags { get; set; }       // Custom tags
}

/// <summary>
/// Metadata for blobs returned from list operations.
/// </summary>
public class BlobMetadata
{
    public string ObjectPath { get; set; } = string.Empty;
    public ulong Size { get; set; }
    public DateTime LastModified { get; set; }
    public string? ETag { get; set; }
    public bool IsDirectory { get; set; }
}

/// <summary>
/// Configuration for blob storage service.
/// </summary>
public class BlobStorageOptions
{
    public string Endpoint { get; set; } = "localhost:9000";
    public string AccessKey { get; set; } = string.Empty;
    public string SecretKey { get; set; } = string.Empty;
    public bool UseSSL { get; set; } = false;
    public string Region { get; set; } = "us-east-1";

    public BlobStorageBuckets Buckets { get; set; } = new();
    public BlobStorageTimeouts Timeouts { get; set; } = new();
}

/// <summary>
/// Bucket names configuration.
/// </summary>
public class BlobStorageBuckets
{
    public string Videos { get; set; } = "esslearn-videos";
    public string Images { get; set; } = "esslearn-images";
    public string Icons { get; set; } = "esslearn-icons";
    public string Temp { get; set; } = "esslearn-temp";
}

/// <summary>
/// Timeout configuration for blob operations.
/// </summary>
public class BlobStorageTimeouts
{
    public int UploadTimeoutSeconds { get; set; } = 3600;       // 1 hour
    public int DownloadTimeoutSeconds { get; set; } = 1800;     // 30 minutes
    public int VerificationTimeoutSeconds { get; set; } = 300;  // 5 minutes
}
