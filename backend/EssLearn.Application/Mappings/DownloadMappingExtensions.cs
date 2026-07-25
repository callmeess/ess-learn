using EssLearn.Application.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces.YtDlp;

namespace EssLearn.Application.Mappings;

public static class DownloadMappingExtensions
{
    public static VideoFormatDto ToDto(this VideoFormatInfo f) => new(
        f.FormatId,
        f.Quality,
        f.Container,
        f.FileSizeBytes,
        FormatFileSize(f.FileSizeBytes),
        f.Width,
        f.Height,
        f.VideoCodec,
        f.AudioCodec
    );

    public static DownloadedVideoDto ToDto(this DownloadedVideo d) => new(
        d.Id, d.Quality, d.Container, d.FileSizeBytes, d.Width, d.Height, d.DownloadedAt
    );

    public static DownloadProgressResponseDto ToProgressResponseDto(this DownloadJob? job)
    {
        if (job is null)
            return new DownloadProgressResponseDto(false, null, null, 0, null, null, null);

        return new DownloadProgressResponseDto(
            job.Status != DownloadJobStatus.Completed && job.Status != DownloadJobStatus.Failed,
            job.Id,
            job.Status.ToString(),
            job.ProgressPercent,
            job.ErrorMessage,
            job.CreatedAt,
            job.CompletedAt
        );
    }

    private static string FormatFileSize(long bytes)
    {
        if (bytes == 0) return "Unknown";

        string[] sizes = { "B", "KB", "MB", "GB" };
        int order = 0;
        double size = bytes;

        while (size >= 1024 && order < sizes.Length - 1)
        {
            order++;
            size /= 1024;
        }

        return $"{Math.Round(size, 2)} {sizes[order]}";
    }
}
