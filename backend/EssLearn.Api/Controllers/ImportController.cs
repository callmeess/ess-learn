using EssLearn.Api.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImportController(AppDbContext db, IYouTubeService youtube) : ControllerBase
{
    [HttpPost("playlist")]
    public async Task<ActionResult<ImportResultDto>> ImportPlaylist(ImportPlaylistDto dto)
    {
        // Check if already imported
        var existingPlaylistId = ExtractYoutubePlaylistId(dto.PlaylistUrl);
        if (existingPlaylistId != null)
        {
            var exists = await db.Playlists.AnyAsync(p => p.YoutubePlaylistId == existingPlaylistId);
            if (exists) return Conflict(new { message = "This playlist has already been imported." });
        }

        // Verify field exists
        var field = await db.LearningFields.FindAsync(dto.FieldId);
        if (field is null) return BadRequest(new { message = "Learning field not found." });

        var (playlist, channel, videos) = await youtube.ImportPlaylistAsync(dto.PlaylistUrl, dto.FieldId);

        // Upsert channel
        var existingChannel = await db.Channels.FirstOrDefaultAsync(c => c.YoutubeChannelId == channel.YoutubeChannelId);
        if (existingChannel is not null)
        {
            existingChannel.Title = channel.Title;
            existingChannel.ThumbnailUrl = channel.ThumbnailUrl;
            existingChannel.SubscriberCount = channel.SubscriberCount;
            existingChannel.UpdatedAt = DateTime.UtcNow;
            playlist.Channel = existingChannel;
        }
        else
        {
            db.Channels.Add(channel);
            playlist.Channel = channel;
        }

        db.Playlists.Add(playlist);
        foreach (var video in videos)
        {
            video.Playlist = playlist;
            db.Videos.Add(video);
        }

        await db.SaveChangesAsync();

        return Ok(new ImportResultDto(playlist.Id, playlist.Title, videos.Count, channel.Title));
    }

    private static string? ExtractYoutubePlaylistId(string url)
    {
        if (!url.Contains('?')) return null;
        var match = System.Text.RegularExpressions.Regex.Match(url, @"[?&]list=([a-zA-Z0-9_-]+)");
        return match.Success ? match.Groups[1].Value : null;
    }
}
