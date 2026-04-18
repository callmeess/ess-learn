using EssLearn.Core.Entities;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using EssLearn.Infrastructure.Repositories;
using EssLearn.Infrastructure.Services;
using EssLearn.Infrastructure.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

namespace EssLearn.Api.Extensions;

/// <summary>
/// Extension methods for configuring application services.
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds all application services to the dependency injection container.
    /// </summary>
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddApplicationDbContext(config);
        services.AddApplicationCaching(config);
        services.AddExternalServices(config);
        services.AddApplicationUnitOfWork();
        services.AddApplicationServiceLayer();
        services.AddApplicationControllers();
        services.AddApplicationSwagger();
        services.AddApplicationCors();

        return services;
    }

    /// <summary>
    /// Registers the application database context.
    /// </summary>
    private static IServiceCollection AddApplicationDbContext(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(opt =>
            opt.UseNpgsql(config.GetConnectionString("Database")));

        return services;
    }

    /// <summary>
    /// Registers caching services (Redis).
    /// </summary>
    private static IServiceCollection AddApplicationCaching(this IServiceCollection services, IConfiguration config)
    {
        services.AddStackExchangeRedisCache(opt =>
        {
            opt.Configuration = config.GetConnectionString("Redis");
            opt.InstanceName = "esslearn:";
        });

        return services;
    }

    /// <summary>
    /// Registers external services (YouTube, Video Download).
    /// </summary>
    private static IServiceCollection AddExternalServices(this IServiceCollection services, IConfiguration config)
    {
        // YouTube API Service
        var ytApiKey = config["YouTube:ApiKey"]
            ?? throw new InvalidOperationException("YouTube:ApiKey is not configured.");
        services.AddSingleton<IYouTubeService>(new YouTubeImportService(ytApiKey));

        // Video Download Service
        services.AddScoped<IVideoDownloadService, VideoDownloadService>();

        return services;
    }

    /// <summary>
    /// Registers the Unit of Work pattern and repositories.
    /// </summary>
    private static IServiceCollection AddApplicationUnitOfWork(this IServiceCollection services)
    {
        // Generic repository
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork.UnitOfWork>();

        return services;
    }

    /// <summary>
    /// Registers all business logic services.
    /// </summary>
    private static IServiceCollection AddApplicationServiceLayer(this IServiceCollection services)
    {
        services.AddScoped<IFieldService, FieldService>();
        services.AddScoped<IPlaylistService, PlaylistService>();
        services.AddScoped<IVideoService, VideoService>();
        services.AddScoped<IImportService, ImportService>();
        services.AddScoped<IDashboardService, DashboardService>();
        services.AddScoped<IDownloadService, DownloadService>();

        return services;
    }

    /// <summary>
    /// Registers controllers and configures JSON serialization.
    /// </summary>
    private static IServiceCollection AddApplicationControllers(this IServiceCollection services)
    {
        services.AddControllers()
            .AddJsonOptions(o => o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);

        return services;
    }

    /// <summary>
    /// Registers Swagger/OpenAPI documentation.
    /// </summary>
    private static IServiceCollection AddApplicationSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "EssLearn API", Version = "v1" });
        });

        return services;
    }

    /// <summary>
    /// Configures CORS policies.
    /// </summary>
    private static IServiceCollection AddApplicationCors(this IServiceCollection services)
    {
        services.AddCors(opt => opt.AddDefaultPolicy(p =>
            p.WithOrigins("http://localhost:4200", "http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod()));

        return services;
    }
}
