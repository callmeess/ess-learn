using EssLearn.Api.Extensions;
using EssLearn.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplicationServices(builder.Configuration);
// builder.Services.AddScoped<DataSeeder>();

var app = builder.Build();

// Auto-migrate database on startup
using var scope = app.Services.CreateScope();
var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
var connectionString = app.Configuration.GetConnectionString("Database");

var migrator = new DatabaseMigrator(connectionString);
await migrator.ApplyMigrationsAsync();

// Swagger UI in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "EssLearn API v1"));
}

app.UseCors();
app.MapControllers();
app.Run();
