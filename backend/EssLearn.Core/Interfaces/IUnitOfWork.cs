using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;

namespace EssLearn.Core.Interfaces;

/// <summary>
/// Unit of Work pattern interface for coordinating multiple repositories
/// and managing transactions across the application.
/// </summary>
public interface IUnitOfWork : IAsyncDisposable
{
    /// <summary>
    /// Repository for LearningField entities.
    /// </summary>
    IRepository<LearningField> LearningFields { get; }

    /// <summary>
    /// Repository for Channel entities.
    /// </summary>
    IRepository<Channel> Channels { get; }

    /// <summary>
    /// Repository for Playlist entities.
    /// </summary>
    IRepository<Playlist> Playlists { get; }

    /// <summary>
    /// Repository for Video entities.
    /// </summary>
    IRepository<Video> Videos { get; }

    /// <summary>
    /// Repository for VideoProgress entities.
    /// </summary>
    IRepository<VideoProgress> VideoProgresses { get; }

    /// <summary>
    /// Repository for DownloadedVideo entities.
    /// </summary>
    IRepository<DownloadedVideo> DownloadedVideos { get; }

    /// <summary>
    /// Saves all changes made to repositories as a single transaction.
    /// </summary>
    Task<int> SaveChangesAsync();

    /// <summary>
    /// Begins a new transaction.
    /// </summary>
    Task BeginTransactionAsync();

    /// <summary>
    /// Commits the current transaction.
    /// </summary>
    Task CommitAsync();

    /// <summary>
    /// Rolls back the current transaction.
    /// </summary>
    Task RollbackAsync();
}
