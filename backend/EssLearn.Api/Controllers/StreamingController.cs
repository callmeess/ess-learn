using EssLearn.Application.Dtos;
using EssLearn.Application.Dtos.BlobStorage;
using EssLearn.Application.Interfaces;
using EssLearn.Core.Entities;
using EssLearn.Infrastructure.Data;
using EssLearn.Infrastructure.Services.BlobStorage;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StreamingController(
    IBlobStorageService blobStorage,
    BlobStorageOptions blobOptions,
    AppDbContext dbContext) : ControllerBase
{
    [HttpGet("{videoId}/status")]
    public async Task<ActionResult<StreamingStatusDto>> GetStatus(int videoId)
    {
        var transcoded = await dbContext.TranscodedVideos
            .FirstOrDefaultAsync(tv => tv.VideoId == videoId);

        if (transcoded != null)
        {
            var manifestUrl = Url.Action(nameof(GetManifest), new { videoId })!;
            return Ok(new StreamingStatusDto(true, false, 100, manifestUrl));
        }

        var job = await dbContext.TranscodeJobs
            .Where(j => j.VideoId == videoId)
            .OrderByDescending(j => j.CreatedAt)
            .FirstOrDefaultAsync();

        if (job == null)
            return Ok(new StreamingStatusDto(false, false, 0, null));

        var isTranscoding = job.Status == TranscodeJobStatus.Pending ||
                            job.Status == TranscodeJobStatus.Transcoding ||
                            job.Status == TranscodeJobStatus.Uploading;

        return Ok(new StreamingStatusDto(false, isTranscoding, job.ProgressPercent, null));
    }

    [HttpGet("{videoId}/master.m3u8")]
    public async Task<IActionResult> GetManifest(int videoId)
    {
        var transcoded = await dbContext.TranscodedVideos
            .FirstOrDefaultAsync(tv => tv.VideoId == videoId);

        if (transcoded == null)
            return NotFound();

        try
        {
            var stream = await blobStorage.DownloadFileAsync(
                transcoded.BlobBucket, transcoded.HlsManifestBlobPath);

            Response.Headers.CacheControl = "public, max-age=60";
            Response.Headers.ETag = $"\"{transcoded.HlsManifestBlobPath}\"";

            return File(stream, "application/vnd.apple.mpegurl");
        }
        catch
        {
            return NotFound();
        }
    }

    [HttpGet("{videoId}/segments/{segmentName}")]
    public async Task<IActionResult> GetSegment(int videoId, string segmentName)
    {
        var transcoded = await dbContext.TranscodedVideos
            .FirstOrDefaultAsync(tv => tv.VideoId == videoId);

        if (transcoded == null)
            return NotFound();

        var segmentPath = $"{transcoded.HlsSegmentsBlobPath}{segmentName}";

        try
        {
            var stream = await blobStorage.DownloadFileAsync(
                transcoded.BlobBucket, segmentPath);

            Response.Headers.CacheControl = "public, max-age=3600";
            Response.Headers.ETag = $"\"{segmentName}\"";

            return File(stream, "video/mp2t");
        }
        catch
        {
            return NotFound();
        }
    }

    [HttpPost("{videoId}/transcode")]
    public async Task<ActionResult<TranscodeResultDto>> ForceTranscode(int videoId)
    {
        var video = await dbContext.Videos
            .Include(v => v.Playlist)
            .FirstOrDefaultAsync(v => v.Id == videoId);

        if (video == null)
            return NotFound(new { message = "Video not found." });

        var downloadedVideo = await dbContext.DownloadedVideos
            .FirstOrDefaultAsync(dv => dv.PublicVideoId == videoId);

        if (downloadedVideo == null)
            return BadRequest(new { message = "Video must be downloaded before transcoding." });

        var activeJob = await dbContext.TranscodeJobs
            .Where(j => j.VideoId == videoId &&
                (j.Status == TranscodeJobStatus.Pending ||
                 j.Status == TranscodeJobStatus.Transcoding ||
                 j.Status == TranscodeJobStatus.Uploading))
            .FirstOrDefaultAsync();

        if (activeJob != null)
            return BadRequest(new { message = "A transcode job is already in progress for this video." });

        var existingTranscoded = await dbContext.TranscodedVideos
            .FirstOrDefaultAsync(tv => tv.VideoId == videoId);

        if (existingTranscoded != null)
        {
            try
            {
                if (!string.IsNullOrEmpty(existingTranscoded.HlsManifestBlobPath))
                    await blobStorage.DeleteBlobAsync(existingTranscoded.BlobBucket, existingTranscoded.HlsManifestBlobPath);

                if (!string.IsNullOrEmpty(existingTranscoded.HlsSegmentsBlobPath))
                {
                    var segments = await blobStorage.ListBlobsAsync(
                        existingTranscoded.BlobBucket, existingTranscoded.HlsSegmentsBlobPath);
                    foreach (var seg in segments)
                    {
                        await blobStorage.DeleteBlobAsync(existingTranscoded.BlobBucket, seg.ObjectPath);
                    }
                }

                dbContext.TranscodedVideos.Remove(existingTranscoded);
                await dbContext.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"Failed to delete previous transcode: {ex.Message}" });
            }
        }

        var transcodeJob = new TranscodeJob
        {
            VideoId = videoId,
            DownloadedVideoId = downloadedVideo.Id,
            Status = TranscodeJobStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.TranscodeJobs.Add(transcodeJob);
        await dbContext.SaveChangesAsync();

        return Ok(new TranscodeResultDto(transcodeJob.Id, transcodeJob.Status.ToString()));
    }
}
