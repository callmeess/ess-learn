using System.Diagnostics;
using System.Text.Json;
using EssLearn.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EssLearn.Infrastructure.Services;

public class VideoDownloadService : IVideoDownloadService
{
    private readonly string _downloadPath;
    private readonly ILogger<VideoDownloadService> _logger;

    public VideoDownloadService(IConfiguration configuration, ILogger<VideoDownloadService> logger)
    {
        _downloadPath = configuration["VideoStorage:DownloadPath"] ?? "/app/downloads";
        _logger = logger;
        
        // Ensure download directory exists
        Directory.CreateDirectory(_downloadPath);
    }

    public async Task<List<VideoFormatInfo>> GetAvailableFormatsAsync(string youtubeVideoId)
    {
        try
        {
            var url = $"https://www.youtube.com/watch?v={youtubeVideoId}";
            var args = $"--dump-json \"{url}\"";

            var result = await RunYtDlpAsync(args);
            if (result.ExitCode != 0)
            {
                _logger.LogError("yt-dlp failed: {Error}", result.StdErr);
                return new List<VideoFormatInfo>();
            }

            var videoInfo = JsonSerializer.Deserialize<JsonElement>(result.StdOut);
            if (videoInfo.ValueKind != JsonValueKind.Object)
            {
                _logger.LogError("Unexpected yt-dlp JSON output for video {VideoId}", youtubeVideoId);
                return new List<VideoFormatInfo>();
            }

            return MapFormatsFromVideoInfo(videoInfo);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting formats for video {VideoId}", youtubeVideoId);
            return new List<VideoFormatInfo>();
        }
    }

    public async Task<DownloadResult> DownloadVideoAsync(string youtubeVideoId, string formatId, string quality)
    {
        try
        {
            var outputDir = Path.Combine(_downloadPath, youtubeVideoId);
            Directory.CreateDirectory(outputDir);
            
            var outputTemplate = Path.Combine(outputDir, $"{quality}.%(ext)s");
            var url = $"https://www.youtube.com/watch?v={youtubeVideoId}";
            var args = $"-f {formatId} -o \"{outputTemplate}\" \"{url}\"";

            _logger.LogInformation("Downloading video {VideoId} with format {FormatId}", youtubeVideoId, formatId);
            var result = await RunYtDlpAsync(args);
            if (result.ExitCode != 0)
            {
                _logger.LogError("Download failed: {Error}", result.StdErr);
                return new DownloadResult(false, null, 0, result.StdErr);
            }

            // Find the downloaded file
            var files = Directory.GetFiles(outputDir, $"{quality}.*");
            if (files.Length == 0)
                return new DownloadResult(false, null, 0, "Download succeeded but file not found");

            var filePath = files[0];
            var fileInfo = new FileInfo(filePath);
            
            _logger.LogInformation("Successfully downloaded video to {FilePath}", filePath);
            
            return new DownloadResult(true, filePath, fileInfo.Length, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading video {VideoId}", youtubeVideoId);
            return new DownloadResult(false, null, 0, ex.Message);
        }
    }

    // --- Helpers ---

    private record ProcessResult(int ExitCode, string StdOut, string StdErr);

    // Runs yt-dlp and optionally reports progress lines back via IProgress<double>.
    private async Task<ProcessResult> RunYtDlpAsync(string arguments, IProgress<double>? percentProgress = null)
    {
        var startInfo = new ProcessStartInfo
        {
            FileName = "yt-dlp",
            Arguments = arguments,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true
        };

        using var process = Process.Start(startInfo);
        if (process == null)
            return new ProcessResult(-1, string.Empty, "Failed to start yt-dlp process");

        var stdoutBuilder = new System.Text.StringBuilder();

        // Read stdout line-by-line so we can parse progress updates.
        var stdout = process.StandardOutput;
        var stderr = process.StandardError;

        var stdoutTask = Task.Run(async () =>
        {
            while (!stdout.EndOfStream)
            {
                var line = await stdout.ReadLineAsync();
                if (line == null)
                    break;
                stdoutBuilder.AppendLine(line);
                _logger.LogDebug("yt-dlp stdout: {Line}", line);

                // parse progress percent if present and report
                var pct = ParseProgressPercent(line);
                if (pct.HasValue && percentProgress != null)
                    percentProgress.Report(pct.Value);
            }
        });

        var stderrTask = stderr.ReadToEndAsync();

        await Task.WhenAll(stdoutTask, stderrTask, process.WaitForExitAsync());

        var stdOutString = stdoutBuilder.ToString();
        var stdErrString = await stderrTask;

        return new ProcessResult(process.ExitCode, stdOutString, stdErrString);
    }

    // Tries to parse a percentage from a yt-dlp progress line like "[download]  12.3% of 50.00MiB at 1.23MiB/s ETA 00:40"
    private static double? ParseProgressPercent(string line)
    {
        if (string.IsNullOrWhiteSpace(line))
            return null;

        // find first occurrence of '%' and backtrack to capture number
        var pctIndex = line.IndexOf('%');
        if (pctIndex <= 0)
            return null;

        // take up to 8 chars before % to cover values like 100.0
        var start = Math.Max(0, pctIndex - 8);
        var snippet = line[start..(pctIndex)];

        // extract last number in snippet
        for (int i = snippet.Length - 1; i >= 0; i--)
        {
            if (!char.IsDigit(snippet[i]) && snippet[i] != '.' )
            {
                snippet = snippet[(i+1)..];
                break;
            }
        }

        if (double.TryParse(snippet, System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var val))
            return val;

        return null;
    }

    private List<VideoFormatInfo> MapFormatsFromVideoInfo(JsonElement videoInfo)
    {
        if (!videoInfo.TryGetProperty("formats", out var formats) || formats.ValueKind != JsonValueKind.Array)
            return new List<VideoFormatInfo>();

        var formatList = new List<VideoFormatInfo>();
        var seen = new HashSet<string>();
        foreach (var format in formats.EnumerateArray())
        {
            try
            {
                var info = ParseFormat(format);

                // create a signature to dedupe similar entries (same resolution+ext+audio/video)
                var sig = $"{info.Container}|{info.Width?.ToString() ?? "-"}|{info.Height?.ToString() ?? "-"}|{info.HasVideo}|{info.HasAudio}|{info.Quality}";
                if (seen.Add(sig))
                    formatList.Add(info);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Skipping malformed format entry");
            }
        }

        var goodFormats = formatList
            .Where(f => f.HasVideo && f.HasAudio)
            .OrderByDescending(f => f.Height ?? 0)
            .ThenByDescending(f => f.FileSizeBytes)
            .Take(10)
            .ToList();

        _logger.LogDebug("Parsed {Count} unique formats (returning {ReturnCount})", formatList.Count, goodFormats.Count);

        return goodFormats;
    }

    private VideoFormatInfo ParseFormat(JsonElement format)
    {
        var formatId = GetNullableString(format, "format_id") ?? string.Empty;
        var ext = GetNullableString(format, "ext") ?? "mp4";

        int? width = GetNullableInt32(format, "width");
        int? height = GetNullableInt32(format, "height");

        // sometimes height is not provided; try format_note or format string
        if (!height.HasValue)
        {
            var note = GetNullableString(format, "format_note") ?? GetNullableString(format, "format");
            if (!string.IsNullOrEmpty(note))
            {
                // attempt to extract numbers like "720p" or "1080p"
                var m = System.Text.RegularExpressions.Regex.Match(note, "(\\d{3,4})p");
                if (m.Success && int.TryParse(m.Groups[1].Value, out var h))
                    height = h;
            }
        }

        long fileSize = GetNullableInt64(format, "filesize") ?? GetNullableInt64(format, "filesize_approx") ?? 0;

        string? vcodec = GetNullableString(format, "vcodec");
        string? acodec = GetNullableString(format, "acodec");

        bool hasVideo = !string.IsNullOrEmpty(vcodec) && vcodec != "none";
        bool hasAudio = !string.IsNullOrEmpty(acodec) && acodec != "none";

        string quality = height.HasValue ? $"{height}p" : (hasAudio && !hasVideo ? "audio" : "unknown");

        return new VideoFormatInfo(
            formatId,
            quality,
            ext,
            fileSize,
            width,
            height,
            vcodec,
            acodec,
            hasVideo,
            hasAudio
        );
    }

    private static string? GetNullableString(JsonElement parent, string propertyName)
    {
        return parent.TryGetProperty(propertyName, out var el) && el.ValueKind == JsonValueKind.String ? el.GetString() : null;
    }

    private static int? GetNullableInt32(JsonElement parent, string propertyName)
    {
        if (parent.TryGetProperty(propertyName, out var el) && el.ValueKind == JsonValueKind.Number && el.TryGetInt32(out var v))
            return v;
        return null;
    }

    private static long? GetNullableInt64(JsonElement parent, string propertyName)
    {
        if (parent.TryGetProperty(propertyName, out var el) && el.ValueKind == JsonValueKind.Number && el.TryGetInt64(out var v))
            return v;
        return null;
    }

    public string GetVideoPath(int videoId, string quality)
    {
        // This will be implemented to retrieve from database
        return Path.Combine(_downloadPath, videoId.ToString(), $"{quality}.mp4");
    }

    public bool IsVideoDownloaded(int videoId)
    {
        var videoDir = Path.Combine(_downloadPath, videoId.ToString());
        return Directory.Exists(videoDir) && Directory.GetFiles(videoDir).Length > 0;
    }
}
