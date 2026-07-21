using EssLearn.Application.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
using EssLearn.Core.Interfaces.YtDlp;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Infrastructure.Services;


public class ImportService : IImportService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _dbContext;
    private readonly IYtDlpService _ytdlpService;


    public ImportService(IUnitOfWork unitOfWork, AppDbContext dbContext, IYtDlpService ytdlpService)
    {
        _unitOfWork = unitOfWork;
        _dbContext = dbContext;
        _ytdlpService = ytdlpService;
    }


    private string getIdFromUrl(string url)
    {
        var uri = new Uri(url);
        var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
        return query["v"];
    }

    public async Task<ImportResultDto> ImportVideoAsync(ImportVideoDto dto)
    {
        // Check if already imported
        var vidid = getIdFromUrl(dto.VideoUrl);
        var existingVideo = await _dbContext.Videos
            .FirstOrDefaultAsync(v => v.YoutubeVideoId == vidid);

        if (existingVideo != null)
            throw new InvalidOperationException("This video has already been imported.");

        // Verify field exists
        var field = await _unitOfWork.LearningFields.GetByIdAsync(dto.FieldId);
        if (field is null)
            throw new InvalidOperationException("Learning field not found.");

        // Import from YouTube

        var video = await _ytdlpService.GetMetadataAsync($"https://www.youtube.com/watch?v={vidid}");

        // Start transaction
        await _unitOfWork.BeginTransactionAsync();
        try {
            // Add video
            var newVideo = new Video
            {
                Title = video.Title,
                Description = video.Description,
                YoutubeVideoId = video.Id,
                // DurationSeconds = TimeSpan.FromSeconds(video.Duration),
                // ThumbnailUrl = video.ThumbnailUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Videos.AddAsync(newVideo);
            await _unitOfWork.CommitAsync();

            return new ImportResultDto(newVideo.Id, newVideo.Title, 1, null);

        }
        catch
        {
            await _unitOfWork.RollbackAsync();
            throw;
        }
    }

    // public async Task<ImportResultDto> ImportPlaylistAsync(ImportPlaylistDto dto)
    // {
    //     // Check if already imported
    //     var existingPlaylistId = ExtractYoutubePlaylistId(dto.PlaylistUrl);
    //     if (existingPlaylistId != null)
    //     {
    //         var exists = await _dbContext.Playlists
    //             .AnyAsync(p => p.YoutubePlaylistId == existingPlaylistId);
    //         if (exists)
    //             throw new InvalidOperationException("This playlist has already been imported.");
    //     }

    //     // Verify field exists
    //     var field = await _unitOfWork.LearningFields.GetByIdAsync(dto.FieldId);
    //     if (field is null)
    //         throw new InvalidOperationException("Learning field not found.");

    //     // Import from YouTube
    //     // var (playlist, channel, videos) = await _youtubeService.ImportPlaylistAsync(dto.PlaylistUrl, dto.FieldId);

    //     // Start transaction
    //     await _unitOfWork.BeginTransactionAsync();

    //     try
    //     {
    //         // Upsert channel
    //         var existingChannel = await _dbContext.Channels
    //             .FirstOrDefaultAsync(c => c.YoutubeChannelId == channel.YoutubeChannelId);

    //         if (existingChannel is not null)
    //         {
    //             existingChannel.Title = channel.Title;
    //             existingChannel.ThumbnailUrl = channel.ThumbnailUrl;
    //             existingChannel.SubscriberCount = channel.SubscriberCount;
    //             existingChannel.UpdatedAt = DateTime.UtcNow;
    //             await _unitOfWork.Channels.UpdateAsync(existingChannel);
    //             playlist.Channel = existingChannel;
    //         }
    //         else
    //         {
    //             await _unitOfWork.Channels.AddAsync(channel);
    //             playlist.Channel = channel;
    //         }

    //         // Add playlist
    //         await _unitOfWork.Playlists.AddAsync(playlist);

    //         // Add videos
    //         foreach (var video in videos)
    //         {
    //             video.Playlist = playlist;
    //             await _unitOfWork.Videos.AddAsync(video);
    //         }

    //         await _unitOfWork.CommitAsync();

    //         return new ImportResultDto(playlist.Id, playlist.Title, videos.Count, channel.Title);
    //     }
    //     catch
    //     {
    //         await _unitOfWork.RollbackAsync();
    //         throw;
    //     }
    // }

    private static string? ExtractYoutubePlaylistId(string url)
    {
        if (!url.Contains('?')) return null;
        var match = System.Text.RegularExpressions.Regex.Match(url, @"[?&]list=([a-zA-Z0-9_-]+)");
        return match.Success ? match.Groups[1].Value : null;
    }

    public Task<ImportResultDto> ImportPlaylistAsync(ImportPlaylistDto dto)
    {
        throw new NotImplementedException();
    }
}
