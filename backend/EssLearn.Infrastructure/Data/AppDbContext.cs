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
            e.Property(dv => dv.FilePath).HasMaxLength(1000).IsRequired();
            e.Property(dv => dv.Quality).HasMaxLength(50).IsRequired();
            e.Property(dv => dv.FormatId).HasMaxLength(50).IsRequired();
            e.Property(dv => dv.Container).HasMaxLength(20).IsRequired();
            e.HasIndex(dv => dv.VideoId).IsUnique();
            e.HasOne(dv => dv.Video).WithOne().HasForeignKey<DownloadedVideo>(dv => dv.VideoId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}
