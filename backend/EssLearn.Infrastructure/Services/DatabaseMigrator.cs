using Npgsql;
using Microsoft.Extensions.Logging;

namespace EssLearn.Infrastructure.Services;

/// <summary>
/// Handles SQL-based database migrations without Entity Framework.
/// Tracks applied migrations in a history table and applies pending migrations on startup.
/// </summary>
public class DatabaseMigrator
{
    private readonly string _connectionString;
    private readonly string _migrationsPath;
    private readonly ILogger<DatabaseMigrator> _logger;
    private const string MigrationHistoryTable = "__EFMigrationsHistory";

    public DatabaseMigrator(
        string connectionString,
        string? migrationsPath = null)
    {
        _connectionString = connectionString;
        _migrationsPath = migrationsPath ?? Path.Combine(AppContext.BaseDirectory, "migrations");
    }

    /// <summary>
    /// Applies all pending SQL migrations from the migrations directory.
    /// </summary>
    public async Task ApplyMigrationsAsync()
    {
        try
        {
            // _logger.LogInformation($"Checking for migrations in: {_migrationsPath}");

            if (!Directory.Exists(_migrationsPath))
            {
                // _logger.LogWarning($"Migrations directory not found: {_migrationsPath}. Skipping migrations.");
                return;
            }

            using var connection = new NpgsqlConnection(_connectionString);
            await connection.OpenAsync();

            // Ensure migration history table exists
            await CreateMigrationHistoryTableIfNotExistsAsync(connection);

            // Get list of already applied migrations
            var appliedMigrations = await GetAppliedMigrationsAsync(connection);

            // Get all SQL files in migrations directory (sorted for consistent ordering)
            var sqlFiles = Directory.GetFiles(_migrationsPath, "*.sql")
                .OrderBy(f => f)
                .ToList();

            if (sqlFiles.Count == 0)
            {
                // _logger.LogInformation("No SQL migration files found.");
                return;
            }

            // Apply each pending migration
            foreach (var file in sqlFiles)
            {
                var fileName = Path.GetFileName(file);
                
                if (appliedMigrations.Contains(fileName))
                {
                    // _logger.LogInformation($"Migration already applied: {fileName}");
                    continue;
                }

                await ApplyMigrationAsync(connection, file, fileName);
                await RecordMigrationAsync(connection, fileName);
            }

            // _logger.LogInformation("All migrations applied successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error applying migrations");
            throw;
        }
    }

    /// <summary>
    /// Gets the set of migration names that have already been applied.
    /// </summary>
    private async Task<HashSet<string>> GetAppliedMigrationsAsync(NpgsqlConnection connection)
    {
        var query = $"SELECT migration_name FROM {MigrationHistoryTable} WHERE migration_name IS NOT NULL;";

        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = query;
            using var reader = await command.ExecuteReaderAsync();
            
            var migrations = new HashSet<string>();
            while (await reader.ReadAsync())
            {
                migrations.Add(reader.GetString(0));
            }
            
            return migrations;
        }
        catch (PostgresException ex) when (ex.SqlState == "42P01") // Table doesn't exist
        {
            _logger.LogInformation($"Migration history table '{MigrationHistoryTable}' not found. Will be created.");
            return new HashSet<string>();
        }
    }

    /// <summary>
    /// Creates the migration history table if it doesn't already exist.
    /// </summary>
    private async Task CreateMigrationHistoryTableIfNotExistsAsync(NpgsqlConnection connection)
    {
        var createTableSql = $@"
            CREATE TABLE IF NOT EXISTS {MigrationHistoryTable} (
                migration_name VARCHAR(255) PRIMARY KEY,
                applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
            );
        ";

        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = createTableSql;
            await command.ExecuteNonQueryAsync();
            _logger.LogDebug($"Migration history table '{MigrationHistoryTable}' ensured.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error creating migration history table '{MigrationHistoryTable}'");
            throw;
        }
    }

    /// <summary>
    /// Applies a single SQL migration file.
    /// </summary>
    private async Task ApplyMigrationAsync(NpgsqlConnection connection, string filePath, string fileName)
    {
        try
        {
            _logger.LogInformation($"Applying migration: {fileName}");
            var sql = await File.ReadAllTextAsync(filePath);

            using var command = connection.CreateCommand();
            command.CommandText = sql;
            command.CommandTimeout = 300; // 5 minute timeout for migrations
            
            await command.ExecuteNonQueryAsync();
            _logger.LogInformation($"Migration applied successfully: {fileName}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error applying migration {fileName}");
            throw;
        }
    }

    /// <summary>
    /// Records a migration as applied in the history table.
    /// </summary>
    private async Task RecordMigrationAsync(NpgsqlConnection connection, string migrationName)
    {
        var insertSql = $@"
            INSERT INTO {MigrationHistoryTable} (migration_name, applied_at)
            VALUES (@name, @appliedAt)
            ON CONFLICT (migration_name) DO NOTHING;
        ";

        try
        {
            using var command = connection.CreateCommand();
            command.CommandText = insertSql;
            command.Parameters.AddWithValue("@name", migrationName);
            command.Parameters.AddWithValue("@appliedAt", DateTime.UtcNow);
            
            await command.ExecuteNonQueryAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error recording migration {migrationName}");
            throw;
        }
    }
}
