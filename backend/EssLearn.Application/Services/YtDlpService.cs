using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using EssLearn.Core.Dtos;
using EssLearn.Core.Exceptions;
using EssLearn.Core.Interfaces.YtDlp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EssLearn.Infrastructure.Services.YtDlp;


public class YtDlpService : IYtDlpService
{
    private readonly string _binaryPath;
    private readonly string _downloadPath;
    private readonly ILogger<YtDlpService> _logger;

    public YtDlpService(IConfiguration config, ILogger<YtDlpService> logger)
    {
        _logger = logger;

        // Get paths from configuration
        _binaryPath = config["YtDlp:BinaryPath"]
            ?? throw new InvalidOperationException("YtDlp:BinaryPath is not configured");

        _downloadPath = config["YtDlp:DownloadPath"]
            ?? Path.Combine(Path.GetTempPath(), "yt-dlp-downloads");

        // Ensure download directory exists
        Directory.CreateDirectory(_downloadPath);

        _logger.LogInformation("YtDlpService initialized with download path: {DownloadPath}", _downloadPath);
    }

    /// <summary>
    /// Gets metadata for a URL without downloading the video
    /// </summary>
    public async Task<VideoMetadataDto> GetMetadataAsync(string url, CancellationToken ct = default)
    {
        _logger.LogInformation("Fetching metadata for URL: {Url}", url);

        var args = new[] { "--dump-json", "--no-playlist", url };
        var json = await RunAsync(args, ct);

        try
        {
            var metadata = JsonSerializer.Deserialize<VideoMetadataDto>(json)
                ?? throw new InvalidOperationException("Failed to deserialize video metadata");

            _logger.LogInformation("Retrieved metadata for video: {VideoId} - {Title}",
                metadata.Id, metadata.Title);

            return metadata;
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse yt-dlp JSON output");
            throw;
        }
    }

    /// <summary>
    /// Downloads a video with the specified parameters
    /// </summary>
    public async Task<string> DownloadAsync(
        DownloadRequestDto request,
        IProgress<DownloadProgressDto>? progress = null,
        CancellationToken ct = default)
    {
        _logger.LogInformation("Starting download from URL: {Url}", request.Url);

        var args = BuildDownloadArgs(request);
        await RunAsync(args, ct, progress);

        var outputPath = ResolveOutputPath(request);

        _logger.LogInformation("Download completed. Output path: {OutputPath}", outputPath);

        return outputPath;
    }

    /// <summary>
    /// Builds command-line arguments for download based on request parameters
    /// </summary>
    private string[] BuildDownloadArgs(DownloadRequestDto request)
    {
        var args = new List<string>
        {
            "--no-playlist",
            "-o", Path.Combine(_downloadPath, request.OutputTemplate ?? "%(title)s.%(ext)s"),
        };

        // Video format selection
        if (!string.IsNullOrEmpty(request.Format))
        {
            args.AddRange(new[] { "-f", request.Format });
            _logger.LogDebug("Using format: {Format}", request.Format);
        }

        // Subtitles
        if (request.SubtitleLanguages?.Any() == true)
        {
            args.Add("--write-subs");
            args.AddRange(new[] { "--sub-langs", string.Join(",", request.SubtitleLanguages) });
            _logger.LogDebug("Extracting subtitles for languages: {Languages}",
                string.Join(", ", request.SubtitleLanguages));
        }

        // Metadata embedding
        if (request.EmbedThumbnail)
        {
            args.Add("--embed-thumbnail");
        }

        if (request.EmbedMetadata)
        {
            args.Add("--embed-metadata");
        }

        // Audio-only extraction
        if (request.AudioOnly)
        {
            args.AddRange(new[] { "-x", "--audio-format", request.AudioFormat ?? "mp3" });
            _logger.LogDebug("Extracting audio only in format: {AudioFormat}", request.AudioFormat);
        }

        // Rate limiting
        if (!string.IsNullOrEmpty(request.RateLimit))
        {
            args.AddRange(new[] { "--rate-limit", request.RateLimit });
            _logger.LogDebug("Applying rate limit: {RateLimit}", request.RateLimit);
        }

        // Authentication
        if (!string.IsNullOrEmpty(request.CookiesFile))
        {
            args.AddRange(new[] { "--cookies", request.CookiesFile });
            _logger.LogDebug("Using cookies from: {CookiesFile}", request.CookiesFile);
        }

        args.Add(request.Url);
        return args.ToArray();
    }

    /// <summary>
    /// Executes yt-dlp with the given arguments, parsing progress from stdout
    /// </summary>
    public async Task<string> RunAsync(
        string[] args,
        CancellationToken ct = default,
        IProgress<DownloadProgressDto>? progress = null)
    {
        var psi = new ProcessStartInfo(_binaryPath)
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        // Add all arguments
        foreach (var arg in args)
        {
            psi.ArgumentList.Add(arg);
        }

        _logger.LogDebug("Executing yt-dlp with {ArgCount} arguments", args.Length);

        using var process = new Process { StartInfo = psi, EnableRaisingEvents = true };
        var stdout = new StringBuilder();
        var stderr = new StringBuilder();

        // Handle stdout - parse progress and collect output
        process.OutputDataReceived += (_, e) =>
        {
            if (e.Data == null)
                return;

            stdout.AppendLine(e.Data);
            ParseAndReportProgress(e.Data, progress);
            _logger.LogDebug("[yt-dlp] {Output}", e.Data);
        };

        // Handle stderr - log errors
        process.ErrorDataReceived += (_, e) =>
        {
            if (e.Data == null)
                return;

            stderr.AppendLine(e.Data);
            _logger.LogWarning("[yt-dlp stderr] {Error}", e.Data);
        };

        try
        {
            process.Start();
            process.BeginOutputReadLine();
            process.BeginErrorReadLine();

            await process.WaitForExitAsync(ct);

            if (process.ExitCode != 0)
            {
                _logger.LogError("yt-dlp process failed with exit code {ExitCode}", process.ExitCode);
                throw new YtDlpException(process.ExitCode, stderr.ToString());
            }

            return stdout.ToString();
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("yt-dlp process was cancelled");
            process.Kill();
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing yt-dlp");
            throw;
        }
    }

    /// <summary>
    /// Parses progress information from yt-dlp output
    /// Example: [download]  45.3% of 123.45MiB at 2.34MiB/s ETA 00:30
    /// </summary>
    private void ParseAndReportProgress(string line, IProgress<DownloadProgressDto>? progress)
    {
        if (progress == null || !line.Contains("[download]") || !line.Contains('%'))
            return;

        try
        {
            // Regex pattern to extract progress components
            var pattern = @"(\d+\.?\d*)%.*?of\s+([\d.]+\w+).*?at\s+([\d.]+\w+/s).*?ETA\s+(\d+:\d+)";
            var match = Regex.Match(line, pattern);

            if (!match.Success)
                return;

            var progressReport = new DownloadProgressDto(
                PercentComplete: double.Parse(match.Groups[1].Value),
                SizeDownloaded: match.Groups[2].Value,
                DownloadSpeed: match.Groups[3].Value,
                EstimatedTime: match.Groups[4].Value
            );

            progress.Report(progressReport);
        }
        catch (Exception ex)
        {
            _logger.LogDebug(ex, "Failed to parse progress from line: {Line}", line);
        }
    }

    /// <summary>
    /// Resolves the output file path after download
    /// </summary>
    private string ResolveOutputPath(DownloadRequestDto request)
    {
        // If output template is specified, try to find the file in the download directory
        var template = request.OutputTemplate ?? "%(title)s.%(ext)s";
        var directory = Path.Combine(_downloadPath, Path.GetDirectoryName(template) ?? "");

        if (!Directory.Exists(directory))
            return Path.Combine(_downloadPath, template);

        // Return the expected path (actual file matching would require title extraction)
        return Path.Combine(directory, Path.GetFileName(template));
    }
}
