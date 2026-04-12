namespace EssLearn.Core.Entities;

public class Channel
{
    public int Id { get; set; }
    public string YoutubeChannelId { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ThumbnailUrl { get; set; }
    public long SubscriberCount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Playlist> Playlists { get; set; } = [];
}
