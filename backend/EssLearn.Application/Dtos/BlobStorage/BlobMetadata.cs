namespace EssLearn.Application.Dtos.BlobStorage;

public class BlobMetadata
{
    public string ObjectPath { get; set; } = string.Empty;
    public ulong Size { get; set; }
    public DateTime LastModified { get; set; }
    public string? ETag { get; set; }
    public bool IsDirectory { get; set; }
}
