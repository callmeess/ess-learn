using System.Runtime.InteropServices;
using Microsoft.Extensions.Configuration;

namespace EssLearn.Infrastructure.Services.YtDlp;

/// <summary>
/// Resolves the yt-dlp executable path for the current operating system.
/// Falls back to a local tools directory so the app works on both Windows
/// (no .exe in the configured path) and Linux/Docker deployments.
/// </summary>
internal static class YtDlpPathResolver
{
    public static string Resolve(IConfiguration config)
    {
        var isWindows = RuntimeInformation.IsOSPlatform(OSPlatform.Windows);
        var configured = config["yt-dlp:ExecutablePath"];

        if (!string.IsNullOrWhiteSpace(configured))
        {
            if (File.Exists(configured))
                return configured;

            // On Windows a configured path without an .exe extension won't resolve
            if (isWindows && !Path.HasExtension(configured))
            {
                var withExe = configured + ".exe";
                if (File.Exists(withExe))
                    return withExe;
            }
        }

        // Fallback: local tools directory, populated by YtDlpManager/YtDlpUpdateWorker on startup
        return Path.Combine(
            AppContext.BaseDirectory,
            "tools",
            isWindows ? "yt-dlp.exe" : "yt-dlp");
    }
}
