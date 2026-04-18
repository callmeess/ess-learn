using EssLearn.Core.Interfaces.YtDlp;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace EssLearn.Infrastructure.Workers;

/// Background service that ensures yt-dlp is installed on startup
/// and automatically checks for updates every 24 hours
public class YtDlpUpdateWorker : BackgroundService
{
    private readonly IYtDlpManager _manager;
    private readonly ILogger<YtDlpUpdateWorker> _logger;

    public YtDlpUpdateWorker(IYtDlpManager manager, ILogger<YtDlpUpdateWorker> logger)
    {
        _manager = manager;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        try
        {
            _logger.LogInformation("YtDlpUpdateWorker starting. Ensuring yt-dlp is installed...");

            // Ensure yt-dlp is installed on startup
            await _manager.EnsureInstalledAsync(ct);
            _logger.LogInformation("yt-dlp installation check completed");

            // Check for updates on startup
            await _manager.UpdateAsync(ct);
            _logger.LogInformation("Initial yt-dlp update check completed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to initialize yt-dlp during startup");
            // Don't throw - allow application to start even if yt-dlp initialization fails
        }

        // Schedule periodic updates every 24 hours
        using var timer = new PeriodicTimer(TimeSpan.FromHours(24));

        try
        {
            while (await timer.WaitForNextTickAsync(ct))
            {
                try
                {
                    _logger.LogInformation("Running scheduled yt-dlp update check");
                    await _manager.UpdateAsync(ct);
                    _logger.LogInformation("Scheduled yt-dlp update completed successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Scheduled yt-dlp update failed");
                    // Continue - next scheduled update will try again
                }
            }
        }
        catch (OperationCanceledException)
        {
            _logger.LogInformation("YtDlpUpdateWorker cancelled");
        }
        finally
        {
            timer.Dispose();
        }
    }
}
