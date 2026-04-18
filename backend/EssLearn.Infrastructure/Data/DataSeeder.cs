// using System.Text.Json;
// using EssLearn.Core.Entities;
// using EssLearn.Infrastructure.Data;
// using Microsoft.AspNetCore.Hosting;
// using Microsoft.EntityFrameworkCore;

// namespace EssLearn.Infrastructure.Seeders;

// public class DataSeeder
// {
//     private readonly AppDbContext _dbContext;
//     private readonly IWebHostEnvironment _env;

//     public DataSeeder(AppDbContext dbContext, IWebHostEnvironment env)
//     {
//         _dbContext = dbContext;
//         _env = env;
//     }

//     public async Task SeedAsync()
//     {
//         // Check if database already has data
//         if (await _dbContext.LearningFields.AnyAsync())
//             return;

//         try
//         {
//             var jsonPath = Path.Combine(_env.ContentRootPath, "Assets", "seed-data.json");

//             if (!File.Exists(jsonPath))
//             {
//                 Console.WriteLine($"Seed data file not found at {jsonPath}");
//                 return;
//             }

//             var jsonContent = await File.ReadAllTextAsync(jsonPath);
//             using var doc = JsonDocument.Parse(jsonContent);
//             var root = doc.RootElement;

//             // Seed Channels
//             var channels = new List<Channel>();
//             if (root.TryGetProperty("channels", out var channelsArray))
//             {
//                 foreach (var channelObj in channelsArray.EnumerateArray())
//                 {
//                     var channel = new Channel
//                     {
//                         YoutubeChannelId = channelObj.GetProperty("youtubeChannelId").GetString() ?? "",
//                         Title = channelObj.GetProperty("title").GetString() ?? "",
//                         ThumbnailUrl = channelObj.TryGetProperty("thumbnailUrl", out var thumb)
//                             ? thumb.GetString()
//                             : null,
//                         SubscriberCount = channelObj.TryGetProperty("subscriberCount", out var subs)
//                             ? subs.GetInt64()
//                             : 0
//                     };
//                     channels.Add(channel);
//                 }
//                 await _dbContext.Channels.AddRangeAsync(channels);
//                 await _dbContext.SaveChangesAsync();
//             }

//             // Seed Learning Fields
//             var fields = new List<LearningField>();
//             if (root.TryGetProperty("fields", out var fieldsArray))
//             {
//                 foreach (var fieldObj in fieldsArray.EnumerateArray())
//                 {
//                     var field = new LearningField
//                     {
//                         Name = fieldObj.GetProperty("name").GetString() ?? "",
//                         Description = fieldObj.TryGetProperty("description", out var desc)
//                             ? desc.GetString()
//                             : null,
//                         Color = fieldObj.TryGetProperty("color", out var color)
//                             ? color.GetString() ?? "#6366f1"
//                             : "#6366f1",
//                         Icon = fieldObj.TryGetProperty("icon", out var icon)
//                             ? icon.GetString()
//                             : null,
//                         CreatedAt = DateTime.UtcNow,
//                         UpdatedAt = DateTime.UtcNow
//                     };
//                     fields.Add(field);
//                 }
//                 await _dbContext.LearningFields.AddRangeAsync(fields);
//                 await _dbContext.SaveChangesAsync();
//             }

//             // Seed Playlists
//             var playlists = new List<Playlist>();
//             if (root.TryGetProperty("playlists", out var playlistsArray))
//             {
//                 foreach (var playlistObj in playlistsArray.EnumerateArray())
//                 {
//                     var fieldIndex = playlistObj.GetProperty("fieldIndex").GetInt32();
//                     var channelIndex = playlistObj.GetProperty("channelIndex").GetInt32();

//                     if (fieldIndex >= 0 && fieldIndex < fields.Count &&
//                         channelIndex >= 0 && channelIndex < channels.Count)
//                     {
//                         var playlist = new Playlist
//                         {
//                             FieldId = fields[fieldIndex].Id,
//                             ChannelId = channels[channelIndex].Id,
//                             Title = playlistObj.GetProperty("title").GetString() ?? "",
//                             Description = playlistObj.TryGetProperty("description", out var pdesc)
//                                 ? pdesc.GetString()
//                                 : null,
//                             ThumbnailUrl = playlistObj.TryGetProperty("thumbnailUrl", out var pthumb)
//                                 ? pthumb.GetString()
//                                 : null,
//                             SourceUrl = playlistObj.TryGetProperty("sourceUrl", out var psource)
//                 ? psource.GetString()
//                       : null,
//                             CreatedAt = DateTime.UtcNow,
//                             UpdatedAt = DateTime.UtcNow
//                         };
//                         playlists.Add(playlist);
//                     }
//                 }
//                 await _dbContext.Playlists.AddRangeAsync(playlists);
//                 await _dbContext.SaveChangesAsync();
//             }

//             // Seed Videos
//             if (root.TryGetProperty("videos", out var videosArray))
//             {
//                 var videos = new List<Video>();
//                 var progresses = new List<VideoProgress>();

//                 foreach (var videoObj in videosArray.EnumerateArray())
//                 {
//                     var playlistIndex = videoObj.GetProperty("playlistIndex").GetInt32();

//                     if (playlistIndex >= 0 && playlistIndex < playlists.Count)
//                     {
//                         var video = new Video
//                         {
//                             PlaylistId = playlists[playlistIndex].Id,
//                             YoutubeVideoId = videoObj.TryGetProperty("youtubeVideoId", out var yid)
//                                 ? yid.GetString()
//                                 : null,
//                             Title = videoObj.GetProperty("title").GetString() ?? "",
//                             ThumbnailUrl = videoObj.TryGetProperty("thumbnailUrl", out var vthumb)
//                                 ? vthumb.GetString()
//                                 : null,
//                             Url = videoObj.TryGetProperty("url", out var vurl)
//                                 ? vurl.GetString()
//                                 : null,
//                             DurationSeconds = videoObj.GetProperty("durationSeconds").GetInt32(),
//                             Position = videoObj.GetProperty("position").GetInt32(),
//                             PublishedAt = videoObj.TryGetProperty("publishedAt", out var pub)
//                                 ? DateTime.Parse(pub.GetString() ?? "")
//                                 : (DateTime?)null,
//                             CreatedAt = DateTime.UtcNow,
//                             UpdatedAt = DateTime.UtcNow
//                         };
//                         videos.Add(video);
//                     }
//                 }

//                 await _dbContext.Videos.AddRangeAsync(videos);
//                 await _dbContext.SaveChangesAsync();

//                 // Create progress entries for each video
//                 foreach (var video in videos)
//                 {
//                     var progress = new VideoProgress
//                     {
//                         VideoId = video.Id,
//                         Status = Core.Enums.VideoStatus.NotStarted,
//                         WatchedSeconds = 0,
//                         CreatedAt = DateTime.UtcNow,
//                         UpdatedAt = DateTime.UtcNow
//                     };
//                     progresses.Add(progress);
//                 }

//                 await _dbContext.VideoProgresses.AddRangeAsync(progresses);
//                 await _dbContext.SaveChangesAsync();
//             }

//             Console.WriteLine("Database seeded successfully with sample data.");
//         }
//         catch (Exception ex)
//         {
//             Console.WriteLine($"Error seeding database: {ex.Message}");
//             throw;
//         }
//     }
// }
