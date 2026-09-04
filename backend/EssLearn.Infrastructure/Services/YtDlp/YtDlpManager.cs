using EssLearn.Application.Interfaces.YtDlp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace EssLearn.Infrastructure.Services.YtDlp;

public class YtDlpManager : IYtDlpManager
{
    private readonly string _binaryPath;
    private readonly ILogger<YtDlpManager> _logger;

    public YtDlpManager(IConfiguration config, ILogger<YtDlpManager> logger)
    {
        _logger = logger;

        // Get binary path from config or use a platform-appropriate default
        _binaryPath = YtDlpPathResolver.Resolve(config);

        _logger.LogInformation("YtDlp binary path resolved");
    }

    public async Task EnsureInstalledAsync(CancellationToken ct = default)
    {
        if (File.Exists(_binaryPath))
        {
            _logger.LogInformation("yt-dlp binary already exists ");
            return;
        }

        _logger.LogWarning(
            "yt-dlp binary not found at '{BinaryPath}'. " +
            "It is expected to be installed in the Docker image (pip3). Downloading is not supported.",
            _binaryPath);
    }


    public async Task UpdateAsync(CancellationToken ct = default)
    {
        if (!File.Exists(_binaryPath))
        {
            _logger.LogWarning("Cannot update yt-dlp: binary not found at '{BinaryPath}'", _binaryPath);
            return;
        }

        _logger.LogInformation("Updating yt-dlp to latest stable version");
        await RunUpdateCommandAsync(ct);
    }

    private async Task RunUpdateCommandAsync(CancellationToken ct = default)
    {
        var psi = new System.Diagnostics.ProcessStartInfo(_binaryPath)
        {
            Arguments = "--update-to stable",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        try
        {
            using var process = System.Diagnostics.Process.Start(psi)
                ?? throw new InvalidOperationException($"Failed to start yt-dlp process");

            await process.WaitForExitAsync(ct);

            if (process.ExitCode == 0)
            {
                _logger.LogInformation("yt-dlp updated successfully");
            }
            else
            {
                var error = await process.StandardError.ReadToEndAsync(ct);
                _logger.LogWarning("yt-dlp update completed with exit code {ExitCode}: {Error}",
                    process.ExitCode, error);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating yt-dlp");
            throw;
        }
    }
}