using EssLearn.Application.Dtos;
using EssLearn.Application.Interfaces;
using EssLearn.Core.Enums;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Infrastructure.Services;

public class ChannelService : IChannelService
{
    private readonly AppDbContext _dbContext;

    public ChannelService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<ChannelListItemDto>> GetAllAsync()
    {
        var channels = await _dbContext.Channels
            .Where(c => c.Playlists.Any(p => p.Videos.Any()))
            .Select(c => new ChannelListItemDto(
                c.Id,
                c.Title,
                c.ThumbnailUrl,
                c.SubscriberCount,
                c.Playlists.SelectMany(p => p.Videos).Count(),
                c.Playlists.SelectMany(p => p.Videos).Count(v => v.DownloadedVideo != null),
                c.Playlists.SelectMany(p => p.Videos).Count(v => v.Progress != null && v.Progress.Status == VideoStatus.Completed),
                c.Playlists.SelectMany(p => p.Videos).Sum(v => v.DurationSeconds),
                c.Playlists.SelectMany(p => p.Videos).Sum(v => v.Progress != null ? v.Progress.WatchedSeconds : 0)
            ))
            .ToListAsync();

        return channels;
    }
}
