namespace EssLearn.Core.Interfaces.YtDlp;

/// <summary>
/// Low-level yt-dlp binary manager
/// Handles downloading, installing, and updating the yt-dlp executable
/// Implemented in Infrastructure layer as YtDlpManager
/// </summary>
public interface IYtDlpManager
{
    /// <summary>
    /// Ensures the yt-dlp binary is installed, downloading it if necessary
    /// </summary>
    /// <param name="ct">Cancellation token</param>
    Task EnsureInstalledAsync(CancellationToken ct = default);

    /// <summary>
    /// Updates the installed yt-dlp binary to the latest stable version
    /// </summary>
    /// <param name="ct">Cancellation token</param>
    Task UpdateAsync(CancellationToken ct = default);
}
