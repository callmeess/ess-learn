namespace EssLearn.Application.Dtos.BlobStorage;

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
