namespace EssLearn.Application.Dtos.BlobStorage;

public class BlobStorageMetadata
{
    public string Name { get; set; } = string.Empty;           // Object name
    public long Size { get; set; }
    public DateTime LastModified { get; set; }
    public string? ETag { get; set; }                           // MinIO ETag
    public string? ContentType { get; set; }
    public Dictionary<string, string>? Tags { get; set; }       // Custom tags
}
