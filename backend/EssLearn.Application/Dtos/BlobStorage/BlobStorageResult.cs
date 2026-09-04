namespace EssLearn.Application.Dtos.BlobStorage;


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
