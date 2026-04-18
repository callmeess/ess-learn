using EssLearn.Application.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Infrastructure.Services;

/// <summary>
/// Service for importing playlists and videos from external sources.
/// </summary>
public class ImportService : IImportService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IYouTubeService _youtubeService;
    private readonly AppDbContext _dbContext;

    public ImportService(IUnitOfWork unitOfWork, IYouTubeService youtubeService, AppDbContext dbContext)
    {
        _unitOfWork = unitOfWork;
        _youtubeService = youtubeService;
        _dbContext = dbContext;
    }

    public async Task<ImportResultDto> ImportPlaylistAsync(ImportPlaylistDto dto)
    {
        // Check if already imported
        var existingPlaylistId = ExtractYoutubePlaylistId(dto.PlaylistUrl);
        if (existingPlaylistId != null)
        {
            var exists = await _dbContext.Playlists
                .AnyAsync(p => p.YoutubePlaylistId == existingPlaylistId);
            if (exists)
                throw new InvalidOperationException("This playlist has already been imported.");
        }

        // Verify field exists
        var field = await _unitOfWork.LearningFields.GetByIdAsync(dto.FieldId);
        if (field is null)
            throw new InvalidOperationException("Learning field not found.");

        // Import from YouTube
        var (playlist, channel, videos) = await _youtubeService.ImportPlaylistAsync(dto.PlaylistUrl, dto.FieldId);

        // Start transaction
        await _unitOfWork.BeginTransactionAsync();

        try
        {
            // Upsert channel
            var existingChannel = await _dbContext.Channels
                .FirstOrDefaultAsync(c => c.YoutubeChannelId == channel.YoutubeChannelId);

            if (existingChannel is not null)
            {
                existingChannel.Title = channel.Title;
                existingChannel.ThumbnailUrl = channel.ThumbnailUrl;
                existingChannel.SubscriberCount = channel.SubscriberCount;
                existingChannel.UpdatedAt = DateTime.UtcNow;
                await _unitOfWork.Channels.UpdateAsync(existingChannel);
                playlist.Channel = existingChannel;
            }
            else
            {
                await _unitOfWork.Channels.AddAsync(channel);
                playlist.Channel = channel;
            }

            // Add playlist
            await _unitOfWork.Playlists.AddAsync(playlist);

            // Add videos
            foreach (var video in videos)
            {
                video.Playlist = playlist;
                await _unitOfWork.Videos.AddAsync(video);
            }

            await _unitOfWork.CommitAsync();

            return new ImportResultDto(playlist.Id, playlist.Title, videos.Count, channel.Title);
        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    private static string? ExtractYoutubePlaylistId(string url)
    {
        if (!url.Contains('?')) return null;
        var match = System.Text.RegularExpressions.Regex.Match(url, @"[?&]list=([a-zA-Z0-9_-]+)");
        return match.Success ? match.Groups[1].Value : null;
    }
}
