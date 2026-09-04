namespace EssLearn.Application.Dtos.BlobStorage;

public class BlobStorageTimeouts
{
    public int UploadTimeoutSeconds { get; set; } = 3600;       // 1 hour
    public int DownloadTimeoutSeconds { get; set; } = 1800;     // 30 minutes
    public int VerificationTimeoutSeconds { get; set; } = 300;  // 5 minutes
}
