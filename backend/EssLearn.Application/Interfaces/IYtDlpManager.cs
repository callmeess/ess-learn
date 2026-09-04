namespace EssLearn.Application.Interfaces.YtDlp;

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
