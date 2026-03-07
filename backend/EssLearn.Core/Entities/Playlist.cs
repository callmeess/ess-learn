namespace EssLearn.Core.Entities;

public class Playlist
{
    public int Id { get; set; }
    public int FieldId { get; set; }
    public int? ChannelId { get; set; }
    public string? YoutubePlaylistId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? SourceUrl { get; set; }
    public int TotalVideos { get; set; }
    public DateTime? PublishedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public LearningField Field { get; set; } = null!;
    public Channel? Channel { get; set; }
    public ICollection<Video> Videos { get; set; } = [];
}
