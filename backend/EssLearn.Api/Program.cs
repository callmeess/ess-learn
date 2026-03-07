using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using EssLearn.Infrastructure.Services;
using Microsoft.Extensions.FileProviders;
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
var ytApiKey = builder.Configuration["YouTube:ApiKey"];
builder.Services.AddSingleton<IYouTubeService>(
    string.IsNullOrWhiteSpace(ytApiKey)
        ? new UnavailableYouTubeService()
        : new YouTubeImportService(ytApiKey));

// Offline data path (mounted docker volume)
var offlineDataRoot = builder.Configuration["OfflineData:RootPath"] ?? "/data";

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
if (Directory.Exists(offlineDataRoot))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(offlineDataRoot),
        RequestPath = "/media"
    });
}
app.MapControllers();
app.Run();
