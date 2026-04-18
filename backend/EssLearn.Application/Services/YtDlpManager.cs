using System.Runtime.InteropServices;
using EssLearn.Core.Interfaces.YtDlp;
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

        // Get binary path from config or use default location
        _binaryPath = config["YtDlp:BinaryPath"]
            ?? Path.Combine(AppContext.BaseDirectory, "tools", "yt-dlp");

        _logger.LogInformation("YtDlp binary path: {BinaryPath}", _binaryPath);
    }

    public async Task EnsureInstalledAsync(CancellationToken ct = default)
    {
        if (File.Exists(_binaryPath))
        {
            _logger.LogInformation("yt-dlp binary already exists at {Path}", _binaryPath);
            return;
        }

        _logger.LogInformation("yt-dlp binary not found. Downloading...");
        await DownloadLatestAsync(ct);
        _logger.LogInformation("yt-dlp installed successfully at {Path}", _binaryPath);
    }


    public async Task UpdateAsync(CancellationToken ct = default)
    {
        _logger.LogInformation("Updating yt-dlp to latest stable version");

        // We would call YtDlpService here but to avoid circular dependency,
        // this is implemented as a separate method that can be called
        await RunUpdateCommandAsync(ct);
    }

    private async Task DownloadLatestAsync(CancellationToken ct = default)
    {
        var directory = Path.GetDirectoryName(_binaryPath);
        if (directory != null)
        {
            Directory.CreateDirectory(directory);
        }

        // Construct download URL based on OS
        var url = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
            ? "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe"
            : "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp";

        try
        {
            _logger.LogInformation("Downloading yt-dlp from {Url}", url);

            using var httpClient = new HttpClient();
            var bytes = await httpClient.GetByteArrayAsync(url, ct);

            await File.WriteAllBytesAsync(_binaryPath, bytes, ct);

            // Set executable permissions on Unix-like systems
            if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                File.SetUnixFileMode(_binaryPath,
                    UnixFileMode.UserExecute |
                    UnixFileMode.UserRead |
                    UnixFileMode.UserWrite);
            }

            _logger.LogInformation("Successfully downloaded yt-dlp ({Bytes} bytes)", bytes.Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download yt-dlp from {Url}", url);
            throw;
        }
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
                ?? throw new InvalidOperationException($"Failed to start yt-dlp process from {_binaryPath}");

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