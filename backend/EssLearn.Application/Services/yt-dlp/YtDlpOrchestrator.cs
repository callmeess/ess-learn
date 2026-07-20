using EssLearn.Core.Dtos;
using EssLearn.Core.Interfaces.YtDlp;
using EssLearn.Application.Interfaces.YtDlp;
using Microsoft.Extensions.Logging;

namespace EssLearn.Application.Services.YtDlp;

/// <summary>
/// High-level orchestration service for yt-dlp operations
/// Bridges application/business logic with infrastructure services
/// </summary>
public class YtDlpOrchestrator : IYtDlpOrchestrator
{
    private readonly IYtDlpService _service;
    private readonly ILogger<YtDlpOrchestrator> _logger;

    public YtDlpOrchestrator(IYtDlpService service, ILogger<YtDlpOrchestrator> logger)
    {
        _service = service;
        _logger = logger;
    }

    /// <summary>
    /// Gets video metadata for a given URL
    /// </summary>
    public async Task<VideoMetadataDto> GetVideoMetadataAsync(string url, CancellationToken ct = default)
    {
        _logger.LogInformation("Getting metadata for: {Url}", url);

        try
        {
            var metadata = await _service.GetMetadataAsync(url, ct);
            _logger.LogInformation("Successfully retrieved metadata for: {Title}", metadata.Title);
            return metadata;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get metadata for: {Url}", url);
            throw;
        }
    }

    /// <summary>
    /// Downloads a video based on request parameters
    /// </summary>
    public async Task<string> DownloadVideoAsync(
        DownloadRequestDto request,
        IProgress<DownloadProgressDto>? progress = null,
        CancellationToken ct = default)
    {
        _logger.LogInformation("Starting download: {Url}", request.Url);

        try
        {
            var outputPath = await _service.DownloadAsync(request, progress, ct);
            _logger.LogInformation("Download completed: {OutputPath}", outputPath);
            return outputPath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Download failed: {Url}", request.Url);
            throw;
        }
    }
}
