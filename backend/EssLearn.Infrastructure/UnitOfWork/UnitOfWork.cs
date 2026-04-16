using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace EssLearn.Infrastructure.UnitOfWork;

/// <summary>
/// Implementation of the Unit of Work pattern for managing repositories
/// and coordinating transactions.
/// </summary>
public class UnitOfWork : IUnitOfWork
{
    private readonly DbContext _dbContext;
    private IDbContextTransaction? _transaction;

    // Repositories
    private IRepository<LearningField>? _learningFields;
    private IRepository<Channel>? _channels;
    private IRepository<Playlist>? _playlists;
    private IRepository<Video>? _videos;
    private IRepository<VideoProgress>? _videoProgresses;
    private IRepository<DownloadedVideo>? _downloadedVideos;

    public UnitOfWork(DbContext dbContext)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
    }

    public IRepository<LearningField> LearningFields =>
        _learningFields ??= new Repository<LearningField>(_dbContext);

    public IRepository<Channel> Channels =>
        _channels ??= new Repository<Channel>(_dbContext);

    public IRepository<Playlist> Playlists =>
        _playlists ??= new Repository<Playlist>(_dbContext);

    public IRepository<Video> Videos =>
        _videos ??= new Repository<Video>(_dbContext);

    public IRepository<VideoProgress> VideoProgresses =>
        _videoProgresses ??= new Repository<VideoProgress>(_dbContext);

    public IRepository<DownloadedVideo> DownloadedVideos =>
        _downloadedVideos ??= new Repository<DownloadedVideo>(_dbContext);

    public async Task<int> SaveChangesAsync()
    {
        return await _dbContext.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _dbContext.Database.BeginTransactionAsync();
    }

    public async Task CommitAsync()
    {
        try
        {
            await SaveChangesAsync();
            await _transaction?.CommitAsync()!;
        }
        catch
        {
            await RollbackAsync();
            throw;
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    public async Task RollbackAsync()
    {
        try
        {
            await _transaction?.RollbackAsync()!;
        }
        finally
        {
            if (_transaction != null)
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (_transaction != null)
        {
            await _transaction.DisposeAsync();
        }
        await _dbContext.DisposeAsync();
    }
}
