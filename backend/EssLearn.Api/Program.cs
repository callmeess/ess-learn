using EssLearn.Api.Extensions;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add all application services
builder.Services.AddApplicationServices(builder.Configuration);
// builder.Services.AddScoped<DataSeeder>();

var app = builder.Build();

// Auto-migrate and seed database in development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "EssLearn API v1"));

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    // var seeder = scope.ServiceProvider.GetRequiredService<DataSeeder>();

    await db.Database.MigrateAsync();
    // await seeder.SeedAsync();
}

app.UseCors();
app.MapControllers();
app.Run();
