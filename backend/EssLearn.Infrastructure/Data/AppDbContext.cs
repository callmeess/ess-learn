using EssLearn.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<LearningField> LearningFields => Set<LearningField>();
    public DbSet<Channel> Channels => Set<Channel>();
    public DbSet<Playlist> Playlists => Set<Playlist>();
    public DbSet<Video> Videos => Set<Video>();
    public DbSet<VideoProgress> VideoProgresses => Set<VideoProgress>();
    public DbSet<DownloadedVideo> DownloadedVideos => Set<DownloadedVideo>();
    public DbSet<StorageIntegrity> StorageIntegrities => Set<StorageIntegrity>();
    public DbSet<BlobStorageLog> BlobStorageLogs => Set<BlobStorageLog>();
    public DbSet<RoadMap> Roadmaps => Set<RoadMap>();
    public DbSet<RoadmapNode> RoadmapNodes => Set<RoadmapNode>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<LearningField>(e =>
        {
            e.HasKey(f => f.Id);
            e.Property(f => f.Name).HasMaxLength(200).IsRequired();
            e.Property(f => f.Color).HasMaxLength(20);
            e.HasIndex(f => f.Name).IsUnique();
        });

        modelBuilder.Entity<Channel>(e =>
        {
            e.HasKey(c => c.Id);
            e.Property(c => c.YoutubeChannelId).HasMaxLength(100).IsRequired();
            e.Property(c => c.Title).HasMaxLength(300).IsRequired();
            e.HasIndex(c => c.YoutubeChannelId).IsUnique();
        });

        modelBuilder.Entity<Playlist>(e =>
        {
            e.HasKey(p => p.Id);
            e.Property(p => p.Title).HasMaxLength(500).IsRequired();
            e.Property(p => p.YoutubePlaylistId).HasMaxLength(100);
            e.HasIndex(p => p.YoutubePlaylistId).IsUnique().HasFilter("\"YoutubePlaylistId\" IS NOT NULL");
            e.HasOne(p => p.Field).WithMany(f => f.Playlists).HasForeignKey(p => p.FieldId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(p => p.Channel).WithMany(c => c.Playlists).HasForeignKey(p => p.ChannelId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Video>(e =>
        {
            e.HasKey(v => v.Id);
            e.Property(v => v.Title).HasMaxLength(500).IsRequired();
            e.Property(v => v.YoutubeVideoId).HasMaxLength(20);
            e.HasIndex(v => new { v.PlaylistId, v.Position });
            e.HasOne(v => v.Playlist).WithMany(p => p.Videos).HasForeignKey(v => v.PlaylistId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VideoProgress>(e =>
        {
            e.HasKey(vp => vp.Id);
            e.HasIndex(vp => vp.VideoId).IsUnique();
            e.HasOne(vp => vp.Video).WithOne(v => v.Progress).HasForeignKey<VideoProgress>(vp => vp.VideoId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DownloadedVideo>(e =>
        {
            e.HasKey(dv => dv.Id);
            e.Property(dv => dv.Quality).HasMaxLength(50).IsRequired();
            e.Property(dv => dv.FormatId).HasMaxLength(50).IsRequired();
            e.Property(dv => dv.Container).HasMaxLength(20).IsRequired();
            e.Property(dv => dv.BlobPath).HasMaxLength(1000);
            e.Property(dv => dv.BlobBucket).HasMaxLength(100).IsRequired();
            e.Property(dv => dv.Sha256Hash).HasMaxLength(64);
            e.HasIndex(dv => dv.PublicVideoId).IsUnique();
            e.HasIndex(dv => dv.BlobPath).IsUnique(false);
            e.HasOne(dv => dv.Video).WithOne().HasForeignKey<DownloadedVideo>(dv => dv.PublicVideoId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(dv => dv.StorageIntegrity).WithOne(si => si.DownloadedVideo).HasForeignKey<StorageIntegrity>(si => si.DownloadedVideoId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<StorageIntegrity>(e =>
        {
            e.HasKey(si => si.Id);
            e.Property(si => si.BlobPath).HasMaxLength(1000).IsRequired();
            e.Property(si => si.BlobBucket).HasMaxLength(100).IsRequired();
            e.Property(si => si.Sha256Hash).HasMaxLength(64).IsRequired();
            e.HasIndex(si => new { si.BlobBucket, si.BlobPath }).IsUnique();
            e.HasIndex(si => si.IsValid);
            e.HasIndex(si => si.CheckedAt);
        });

        modelBuilder.Entity<BlobStorageLog>(e =>
        {
            e.HasKey(bl => bl.Id);
            e.Property(bl => bl.Operation).HasMaxLength(50).IsRequired();
            e.Property(bl => bl.BlobPath).HasMaxLength(1000).IsRequired();
            e.Property(bl => bl.BlobBucket).HasMaxLength(100).IsRequired();
            e.HasIndex(bl => new { bl.BlobBucket, bl.Operation, bl.CreatedAt }).IsUnique(false);
            e.HasIndex(bl => bl.Success);
            e.HasIndex(bl => bl.CreatedAt);
        });

        modelBuilder.Entity<RoadMap>(e =>
        {
            e.HasKey(r => r.Id);
            e.Property(r => r.Name).HasMaxLength(500).IsRequired();
            e.Property(r => r.Iconurl).HasMaxLength(500);
            e.HasMany(r => r.Playlists).WithOne(rn => rn.Roadmap).HasForeignKey(rn => rn.RoadmapId).OnDelete(DeleteBehavior.NoAction);
        });

        modelBuilder.Entity<RoadmapNode>(e =>
        {
            e.HasKey(rn => rn.Id);
            e.HasIndex(rn => new { rn.RoadmapId, rn.PlaylistId }).IsUnique();
            e.HasOne(rn => rn.Roadmap).WithMany(r => r.Playlists).HasForeignKey(rn => rn.RoadmapId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(rn => rn.Playlist).WithMany().HasForeignKey(rn => rn.PlaylistId).OnDelete(DeleteBehavior.NoAction);
            e.HasOne(rn => rn.Parent).WithMany(rn => rn.Children).HasForeignKey("ParentId").OnDelete(DeleteBehavior.SetNull);
        });
    }
}
