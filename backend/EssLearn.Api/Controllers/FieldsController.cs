using EssLearn.Api.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FieldsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<FieldDto>>> GetAll()
    {
        var fields = await db.LearningFields
            .Include(f => f.Playlists).ThenInclude(p => p.Videos).ThenInclude(v => v.Progress)
            .OrderBy(f => f.Name)
            .ToListAsync();

        return fields.Select(MapField).ToList();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FieldDto>> Get(int id)
    {
        var field = await db.LearningFields
            .Include(f => f.Playlists).ThenInclude(p => p.Videos).ThenInclude(v => v.Progress)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (field is null) return NotFound();
        return MapField(field);
    }

    [HttpPost]
    public async Task<ActionResult<FieldDto>> Create(CreateFieldDto dto)
    {
        var field = new LearningField
        {
            Name = dto.Name,
            Description = dto.Description,
            Color = dto.Color ?? "#6366f1",
            Icon = dto.Icon
        };
        db.LearningFields.Add(field);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = field.Id }, MapField(field));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<FieldDto>> Update(int id, UpdateFieldDto dto)
    {
        var field = await db.LearningFields
            .Include(f => f.Playlists).ThenInclude(p => p.Videos).ThenInclude(v => v.Progress)
            .FirstOrDefaultAsync(f => f.Id == id);

        if (field is null) return NotFound();

        field.Name = dto.Name;
        field.Description = dto.Description;
        field.Color = dto.Color ?? field.Color;
        field.Icon = dto.Icon;
        field.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return MapField(field);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var field = await db.LearningFields.FindAsync(id);
        if (field is null) return NotFound();
        db.LearningFields.Remove(field);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static FieldDto MapField(LearningField f)
    {
        var videos = f.Playlists.SelectMany(p => p.Videos).ToList();
        return new FieldDto(
            f.Id, f.Name, f.Description, f.Color, f.Icon, f.CreatedAt,
            f.Playlists.Count,
            videos.Count,
            videos.Count(v => v.Progress?.Status == Core.Enums.VideoStatus.Completed),
            videos.Sum(v => v.DurationSeconds),
            videos.Sum(v => v.Progress?.WatchedSeconds ?? 0)
        );
    }
}
