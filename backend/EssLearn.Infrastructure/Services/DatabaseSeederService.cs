// EssLearn Database Seeding with Entity Framework Core
// Add this to your project for automated seeding during development

using EssLearn.Core.Entities;
using EssLearn.Core.Enums;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EssLearn.Infrastructure.Services;

/// <summary>
/// Database seeding service for development and testing.
/// Integrates with the SQL seed script.
/// </summary>
public class DatabaseSeederService
{
    private readonly AppDbContext _context;
    private readonly ILogger<DatabaseSeederService> _logger;

    public DatabaseSeederService(AppDbContext context, ILogger<DatabaseSeederService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Seeds the database with dummy data from SQL file.
    /// Call this during application startup in development environment.
    /// Note: Database migrations are now handled by DatabaseMigrator (SQL-based).
    /// </summary>
    public async Task SeedDatabaseAsync()
    {
        try
        {
            // Database migrations are now handled by DatabaseMigrator in Program.cs
            _logger.LogInformation("Database migrations are handled by SQL-based DatabaseMigrator.");

            // Check if data already exists (simple check)
            var existingFields = await _context.LearningFields.CountAsync();
            
            if (existingFields > 0)
            {
                _logger.LogInformation("Database already contains data. Skipping seeding.");
                return;
            }

            // Read and execute the SQL seed script
            await ExecuteSeedScriptAsync();
            _logger.LogInformation("Database seeding completed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    /// <summary>
    /// Clears all data and reseeds the database.
    /// WARNING: This deletes all data. Use only in development.
    /// </summary>
    public async Task ReseedDatabaseAsync()
    {
        try
        {
            _logger.LogWarning("Starting database reseed - all data will be cleared!");

            // Delete all data in reverse order of dependencies
            await ClearAllDataAsync();
            _logger.LogInformation("All data cleared successfully.");

            // Reseed with script
            await ExecuteSeedScriptAsync();
            _logger.LogInformation("Database reseed completed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while reseeding the database.");
            throw;
        }
    }

    /// <summary>
    /// Executes the SQL seed script against the database.
    /// </summary>
    private async Task ExecuteSeedScriptAsync()
    {
        try
        {
            // Get the path to the seed script relative to the project
            var seedScriptPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "seed-data.sql");
            
            if (!File.Exists(seedScriptPath))
            {
                // Try alternative paths
                seedScriptPath = Path.Combine(AppContext.BaseDirectory, "seed-data.sql");
            }

            if (!File.Exists(seedScriptPath))
            {
                _logger.LogWarning($"Seed script not found at: {seedScriptPath}");
                _logger.LogInformation("Falling back to programmatic seeding...");
                await SeedProgrammaticallyAsync();
                return;
            }

            var sqlScript = await File.ReadAllTextAsync(seedScriptPath);
            
            // Split script into individual statements and execute
            var statements = sqlScript.Split(new[] { ";" }, StringSplitOptions.RemoveEmptyEntries);
            
            foreach (var statement in statements)
            {
                var trimmedStatement = statement.Trim();
                
                // Skip comments and empty statements
                if (string.IsNullOrWhiteSpace(trimmedStatement) || 
                    trimmedStatement.StartsWith("--"))
                {
                    continue;
                }

                try
                {
                    await _context.Database.ExecuteSqlRawAsync(trimmedStatement);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning($"Statement execution failed: {ex.Message}");
                    // Continue with next statement
                }
            }

            _logger.LogInformation("SQL seed script executed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing SQL seed script.");
            throw;
        }
    }

    /// <summary>
    /// Programmatic seeding as fallback when SQL script is unavailable.
    /// </summary>
    private async Task SeedProgrammaticallyAsync()
    {
        // This is a simplified example - extend as needed
        _logger.LogInformation("Starting programmatic database seeding...");

        // Example: Seed a learning field
        var webDevelopmentField = new LearningField
        {
            Name = "Web Development",
            Description = "Learn modern web development with HTML, CSS, JavaScript, and frameworks.",
            Color = "#3b82f6",
            Icon = "web"
        };

        if (!await _context.LearningFields.AnyAsync(f => f.Name == webDevelopmentField.Name))
        {
            _context.LearningFields.Add(webDevelopmentField);
            await _context.SaveChangesAsync();
        }

        _logger.LogInformation("Programmatic seeding completed.");
    }

    /// <summary>
    /// Clears all data from all tables.
    /// </summary>
    private async Task ClearAllDataAsync()
    {
        try
        {
            // Delete in reverse order of foreign key dependencies
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"RoadmapNodes\"");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Roadmaps\"");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"BlobStorageLogs\"");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"StorageIntegrities\"");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"DownloadedVideos\"");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"VideoProgresses\"");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Videos\"");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Playlists\"");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"Channels\"");
            await _context.Database.ExecuteSqlRawAsync("DELETE FROM \"LearningFields\"");

            _logger.LogInformation("All data cleared from database.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing database data.");
            throw;
        }
    }

    /// <summary>
    /// Gets database statistics for verification.
    /// </summary>
    public async Task<DatabaseStatistics> GetStatisticsAsync()
    {
        return new DatabaseStatistics
        {
            FieldsCount = await _context.LearningFields.CountAsync(),
            ChannelsCount = await _context.Channels.CountAsync(),
            PlaylistsCount = await _context.Playlists.CountAsync(),
            VideosCount = await _context.Videos.CountAsync(),
            VideoProgressCount = await _context.VideoProgresses.CountAsync(),
            DownloadedVideosCount = await _context.DownloadedVideos.CountAsync(),
            RoadmapsCount = await _context.Roadmaps.CountAsync(),
            RoadmapNodesCount = await _context.RoadmapNodes.CountAsync(),
            TotalContentHours = await _context.Videos
                .SumAsync(v => v.DurationSeconds) / 3600.0,
            CompletionPercentage = await _context.VideoProgresses
                .CountAsync(vp => vp.Status == VideoStatus.Completed) * 100.0 / 
                await _context.VideoProgresses.CountAsync()
        };
    }
}

/// <summary>
/// Database statistics DTO
/// </summary>
public class DatabaseStatistics
{
    public int FieldsCount { get; set; }
    public int ChannelsCount { get; set; }
    public int PlaylistsCount { get; set; }
    public int VideosCount { get; set; }
    public int VideoProgressCount { get; set; }
    public int DownloadedVideosCount { get; set; }
    public int RoadmapsCount { get; set; }
    public int RoadmapNodesCount { get; set; }
    public double TotalContentHours { get; set; }
    public double CompletionPercentage { get; set; }
}

// ===================================================================
// USAGE IN Program.cs
// ===================================================================

/*
var builder = WebApplicationBuilder.CreateBuilder(args);

// ... other service configuration ...

// Add the seeder service
builder.Services.AddScoped<DatabaseSeederService>();

var app = builder.Build();

// Seed database on startup (development only)
if (app.Environment.IsDevelopment())
{
    using (var scope = app.Services.CreateScope())
    {
        var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeederService>();
        await seeder.SeedDatabaseAsync();
        
        // Optional: Get statistics to verify seeding
        var stats = await seeder.GetStatisticsAsync();
        Console.WriteLine($"Database Seeding Complete - Videos: {stats.VideosCount}");
    }
}

app.Run();
*/

// ===================================================================
// OPTIONAL: API ENDPOINT FOR SEEDING
// ===================================================================

/*
[ApiController]
[Route("api/[controller]")]
[ApiExplorerSettings(IgnoreApi = true)] // Hide from Swagger in production
public class AdminController : ControllerBase
{
    private readonly DatabaseSeederService _seeder;
    private readonly ILogger<AdminController> _logger;

    public AdminController(DatabaseSeederService seeder, ILogger<AdminController> logger)
    {
        _seeder = seeder;
        _logger = logger;
    }

    /// <summary>
    /// Reseed database with dummy data. DEVELOPMENT ONLY!
    /// </summary>
    [HttpPost("reseed")]
    public async Task<ActionResult> ReseedDatabase()
    {
        if (!HttpContext.Request.Host.Host.Contains("localhost"))
        {
            return Forbid("This endpoint is only available on localhost");
        }

        try
        {
            await _seeder.ReseedDatabaseAsync();
            var stats = await _seeder.GetStatisticsAsync();
            return Ok(new { message = "Database reseeded successfully", statistics = stats });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reseeding database");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Get database statistics.
    /// </summary>
    [HttpGet("statistics")]
    public async Task<ActionResult<DatabaseStatistics>> GetStatistics()
    {
        try
        {
            var stats = await _seeder.GetStatisticsAsync();
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving statistics");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}
*/
