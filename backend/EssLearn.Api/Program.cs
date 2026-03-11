using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using EssLearn.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Database
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Database")));

// Redis
builder.Services.AddStackExchangeRedisCache(opt =>
{
    opt.Configuration = builder.Configuration.GetConnectionString("Redis");
    opt.InstanceName = "esslearn:";
});

// YouTube
var ytApiKey = builder.Configuration["YouTube:ApiKey"]
    ?? throw new InvalidOperationException("YouTube:ApiKey is not configured.");
builder.Services.AddSingleton<IYouTubeService>(new YouTubeImportService(ytApiKey));

// Video Download
builder.Services.AddScoped<IVideoDownloadService, VideoDownloadService>();

// Controllers + JSON
builder.Services.AddControllers()
    .AddJsonOptions(o => o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);

// CORS
builder.Services.AddCors(opt => opt.AddDefaultPolicy(p =>
    p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

// Auto-migrate in development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();
}

app.UseCors();
app.MapControllers();
app.Run();
