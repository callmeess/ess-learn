using System.Text.Json.Serialization;

namespace EssLearn.Application.Dtos;

/// <summary>
/// Video metadata from yt-dlp --dump-json output
/// </summary>
public class VideoMetadataDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = "";

    [JsonPropertyName("title")]
    public string Title { get; set; } = "";

    [JsonPropertyName("uploader")]
    public string Uploader { get; set; } = "";

    [JsonPropertyName("duration")]
    public double Duration { get; set; }

    [JsonPropertyName("thumbnail")]
    public string Thumbnail { get; set; } = "";

    [JsonPropertyName("description")]
    public string Description { get; set; } = "";

    [JsonPropertyName("webpage_url")]
    public string WebpageUrl { get; set; } = "";

    [JsonPropertyName("ext")]
    public string Ext { get; set; } = "";

    [JsonPropertyName("filesize")]
    public long? FileSize { get; set; }

    [JsonPropertyName("channel_id")]
    public string? ChannelId { get; set; }

    [JsonPropertyName("uploader_id")]
    public string? UploaderId { get; set; }

    [JsonPropertyName("playlist_title")]
    public string? PlaylistTitle { get; set; }

    [JsonPropertyName("playlist_id")]
    public string? PlaylistIdytDlp { get; set; }

    [JsonPropertyName("playlist_index")]
    public int? PlaylistIndex { get; set; }

    [JsonPropertyName("formats")]
    public List<FormatInfoDto> Formats { get; set; } = new();
}

/// <summary>
/// Format information from video metadata
/// </summary>
public class FormatInfoDto
{
    [JsonPropertyName("format_id")]
    public string FormatId { get; set; } = "";

    [JsonPropertyName("format_note")]
    public string? FormatNote { get; set; }

    [JsonPropertyName("ext")]
    public string Extension { get; set; } = "";

    [JsonPropertyName("width")]
    public int? Width { get; set; }

    [JsonPropertyName("height")]
    public int? Height { get; set; }

    [JsonPropertyName("fps")]
    public double? Fps { get; set; }

    [JsonPropertyName("acodec")]
    public string? AudioCodec { get; set; }

    [JsonPropertyName("vcodec")]
    public string? VideoCodec { get; set; }

    [JsonPropertyName("filesize")]
    public long? FileSize { get; set; }

    [JsonPropertyName("filesize_approx")]
    public long? FileSizeApprox { get; set; }

    [JsonPropertyName("abr")]
    public double? AudioBitrate { get; set; }

    [JsonPropertyName("vbr")]
    public double? VideoBitrate { get; set; }
}
