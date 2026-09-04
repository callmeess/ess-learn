using System.Diagnostics;
using Microsoft.Extensions.Configuration;

namespace EssLearn.Infrastructure.Services.YtDlp;

/// <summary>
/// Resolves the yt-dlp executable path.
/// Searches common Linux paths if no configured path exists.
/// </summary>
internal static class YtDlpPathResolver
{
    private static readonly string[] CommonPaths =
    [
        "/usr/bin/yt-dlp",
        "/usr/local/bin/yt-dlp",
        "/snap/bin/yt-dlp"
    ];

    public static string Resolve(IConfiguration config)
    {
        var configured = config["yt-dlp:ExecutablePath"];
        if (!string.IsNullOrWhiteSpace(configured) && File.Exists(configured))
            return configured;

        var resolved = FindOnPath();
        if (resolved != null)
            return resolved;

        foreach (var path in CommonPaths)
        {
            if (File.Exists(path))
                return path;
        }

        return configured ?? "/usr/local/bin/yt-dlp";
    }

    private static string? FindOnPath()
    {
        try
        {
            var psi = new ProcessStartInfo("which", "yt-dlp")
            {
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
            };

            using var process = Process.Start(psi);
            if (process == null) return null;

            process.WaitForExit(TimeSpan.FromSeconds(5));

            if (process.ExitCode == 0)
            {
                var output = process.StandardOutput.ReadToEnd().Trim();
                if (!string.IsNullOrWhiteSpace(output) && File.Exists(output))
                    return output;
            }
        }
        catch
        {
            // `which` not available or failed — fall through to common paths
        }

        return null;
    }
}
