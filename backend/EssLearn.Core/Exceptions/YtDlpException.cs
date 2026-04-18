namespace EssLearn.Core.Exceptions;

public class YtDlpException : Exception
{
    public int ExitCode { get; }
    public string StdError { get; }

    public YtDlpException(int exitCode, string stderr)
        : base($"yt-dlp exited with code {exitCode}: {stderr}")
    {
        ExitCode = exitCode;
        StdError = stderr;
    }
}
