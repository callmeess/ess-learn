namespace EssLearn.Core.Dtos;

public record DownloadRequestDto
{
    /// <summary>
    /// URL to download from (YouTube, etc.)
    /// </summary>
    public required string Url { get; init; }

    /// <summary>
    /// Format string (e.g., "bestvideo[height<=1080]+bestaudio")
    /// </summary>
    public string? Format { get; init; }

    /// <summary>
    /// Output filename template (e.g., "%(uploader)s/%(title)s.%(ext)s")
    /// </summary>
    public string? OutputTemplate { get; init; }

    /// <summary>
    /// Extract audio only
    /// </summary>
    public bool AudioOnly { get; init; }

    /// <summary>
    /// Audio format when AudioOnly=true (mp3, opus, etc.)
    /// </summary>
    public string? AudioFormat { get; init; } = "mp3";

    /// <summary>
    /// Embed thumbnail in media
    /// </summary>
    public bool EmbedThumbnail { get; init; }

    /// <summary>
    /// Embed metadata in media
    /// </summary>
    public bool EmbedMetadata { get; init; }

    /// <summary>
    /// Languages for subtitles (e.g., ["en", "ar"])
    /// </summary>
    public string[]? SubtitleLanguages { get; init; }

    /// <summary>
    /// Rate limit (e.g., "2M" for 2 MB/s)
    /// </summary>
    public string? RateLimit { get; init; }

    /// <summary>
    /// Path to cookies file for authentication
    /// </summary>
    public string? CookiesFile { get; init; }
}
