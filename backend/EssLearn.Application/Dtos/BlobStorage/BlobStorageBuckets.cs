namespace EssLearn.Application.Dtos.BlobStorage;

public class BlobStorageBuckets
{
    public string Videos { get; set; } = "esslearn-videos";
    public string Images { get; set; } = "esslearn-images";
    public string Icons { get; set; } = "esslearn-icons";
    public string Temp { get; set; } = "esslearn-temp";
}
