using EssLearn.Core.Entities;

namespace EssLearn.Core.Interfaces;


public interface IUnitOfWork : IAsyncDisposable
{

    IRepository<LearningField> LearningFields { get; }
    IRepository<Channel> Channels { get; }
    IRepository<Playlist> Playlists { get; }
    IRepository<Video> Videos { get; }
    IRepository<VideoProgress> VideoProgresses { get; }
    IRepository<DownloadedVideo> DownloadedVideos { get; }
    IRepository<StorageIntegrity> StorageIntegrities { get; }
    IRepository<BlobStorageLog> BlobStorageLogs { get; }
    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitAsync();
    Task RollbackAsync();
}
