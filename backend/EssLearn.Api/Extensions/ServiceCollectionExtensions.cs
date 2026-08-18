using EssLearn.Application.Interfaces;
using EssLearn.Application.Interfaces.YtDlp;
using EssLearn.Application.Dtos.BlobStorage;
using EssLearn.Api.Services;
using EssLearn.Infrastructure.Data;
using EssLearn.Infrastructure.Interfaces;
using EssLearn.Infrastructure.Repositories;
using EssLearn.Infrastructure.Services;
using EssLearn.Infrastructure.Services.BlobStorage;
using EssLearn.Infrastructure.Services.YtDlp;
using EssLearn.Infrastructure.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using Minio;
using System.Net.Http;

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

        // Dedicated, hardened HttpClient for blob downloads (presigned-URL path).
        // A bounded PooledConnectionLifetime avoids stale-connection failures when
        // MinIO closes idle connections while the shared pool would otherwise keep them.
        services.AddSingleton(new HttpClient(new SocketsHttpHandler
        {
            PooledConnectionLifetime = TimeSpan.FromMinutes(1),
            PooledConnectionIdleTimeout = TimeSpan.FromSeconds(30),
            MaxConnectionsPerServer = 128,
            ConnectTimeout = TimeSpan.FromSeconds(10)
        }));

        // Register MinIO client
        services.AddSingleton<IMinioClient>(sp =>
        {
            var minioClient = new MinioClient()
                .WithEndpoint(blobStorageOptions.Endpoint)
                .WithCredentials(blobStorageOptions.AccessKey, blobStorageOptions.SecretKey)
                .WithRegion(blobStorageOptions.Region)
                .WithHttpClient(new HttpClient(new SocketsHttpHandler
                {
                    PooledConnectionLifetime = TimeSpan.FromMinutes(1),
                    PooledConnectionIdleTimeout = TimeSpan.FromSeconds(30),
                    MaxConnectionsPerServer = 128,
                    ConnectTimeout = TimeSpan.FromSeconds(10)
                }));

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
        services.AddScoped<IRoadmapService, RoadmapService>();

        services.AddHostedService<DownloadJobProcessor>();
        services.AddHostedService<TranscodeJobProcessor>();

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
        // services.AddCors(opt => opt.AddDefaultPolicy(p =>
        //     p.WithOrigins("http://localhost:4200", "http://localhost:5173")
        //         .AllowAnyHeader()
        //         .AllowAnyMethod()));
        services.AddCors(opt => opt.AddDefaultPolicy(p => p.
        AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

        return services;
    }
}
