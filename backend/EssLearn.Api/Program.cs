using EssLearn.Api.Extensions;
using EssLearn.Application.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using DotNetEnv;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices(builder.Configuration);

var app = builder.Build();

// Auto-migrate database on startup using EF Core
using var scope = app.Services.CreateScope();
var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
await dbContext.Database.MigrateAsync();

// Ensure MinIO buckets exist on startup with retries for startup lag
var blobStorage = scope.ServiceProvider.GetRequiredService<IBlobStorageService>();
var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
var maxAttempts = 3;
for (var attempt = 1; attempt <= maxAttempts; attempt++)
{
    try
    {
        await blobStorage.EnsureAllBucketsAsync();
        break;
    }
    catch (Exception ex) when (attempt < maxAttempts)
    {
        logger.LogWarning(ex, "Failed to ensure MinIO buckets on attempt {Attempt}/{MaxAttempts}, retrying in 5s...", attempt, maxAttempts);
        await Task.Delay(TimeSpan.FromSeconds(5));
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Failed to ensure MinIO buckets after {MaxAttempts} attempts. Endpoint: {Endpoint}. Uploads will fail until buckets exist.", maxAttempts, "minio:9000");
    }
}

// Swagger UI in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "EssLearn API v1"));
}

app.UseCors();
app.MapControllers();
app.Run();
