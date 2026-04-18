using EssLearn.Application.Interfaces.YtDlp;
using EssLearn.Application.Services.YtDlp;
using EssLearn.Application.Services.BlobStorage;
using EssLearn.Application.Dtos.BlobStorage;
using EssLearn.Core.Interfaces;
using EssLearn.Core.Interfaces.YtDlp;
using EssLearn.Infrastructure.Data;
using EssLearn.Infrastructure.Repositories;
using EssLearn.Infrastructure.Services;
using EssLearn.Infrastructure.Services.YtDlp;
using EssLearn.Infrastructure.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Minio;

namespace EssLearn.Api.Extensions;


public static class ServiceCollectionExtensions
{
    /// Adds all application services to the dependency injection container.
    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration config)
    {
        services.AddApplicationDbContext(config);
        services.AddApplicationCaching(config);
        services.AddExternalServices(config);
        services.AddBlobStorage(config);
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
    /// Registers blob storage services (MinIO).
    /// </summary>
    private static IServiceCollection AddBlobStorage(this IServiceCollection services, IConfiguration config)
    {
        // Get blob storage options from configuration
        var blobStorageOptions = new BlobStorageOptions();
        config.GetSection("BlobStorage").Bind(blobStorageOptions);
        services.AddSingleton(blobStorageOptions);

        // Register MinIO client
        services.AddSingleton<IMinioClient>(sp =>
        {
            var minioClient = new MinioClient()
                .WithEndpoint(blobStorageOptions.Endpoint)
                .WithCredentials(blobStorageOptions.AccessKey, blobStorageOptions.SecretKey);

            if (blobStorageOptions.UseSSL)
                minioClient = minioClient.WithSSL();

            return minioClient.Build();
        });

        // Register blob storage service
        services.AddScoped<IBlobStorageService, BlobStorageService>();

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

        services.AddScoped<IVideoDownloadService, VideoDownloadService>();
        services.AddScoped<IYtDlpOrchestrator, YtDlpOrchestrator>();
        services.AddScoped<IYtDlpService, YtDlpService>();
        services.AddScoped<IYtDlpManager, YtDlpManager>();

        return services;
    }


    private static IServiceCollection AddApplicationUnitOfWork(this IServiceCollection services)
    {
        // Generic repository
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        return services;
    }

    /// Registers all business logic services.
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

    /// Registers controllers and configures JSON serialization.
    private static IServiceCollection AddApplicationControllers(this IServiceCollection services)
    {
        services.AddControllers()
            .AddJsonOptions(o => o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase);

        return services;
    }


    private static IServiceCollection AddApplicationSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo { Title = "EssLearn API", Version = "v1" });
        });

        return services;
    }

    /// Configures CORS policies.
    private static IServiceCollection AddApplicationCors(this IServiceCollection services)
    {
        services.AddCors(opt => opt.AddDefaultPolicy(p =>
            p.WithOrigins("http://localhost:4200", "http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod()));

        return services;
    }
}
