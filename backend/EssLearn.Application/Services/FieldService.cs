using EssLearn.Application.Dtos;
using EssLearn.Core.Entities;
using EssLearn.Core.Enums;
using EssLearn.Core.Interfaces;
using EssLearn.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace EssLearn.Infrastructure.Services;

public class FieldService : IFieldService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly AppDbContext _dbContext;

    public FieldService(IUnitOfWork unitOfWork, AppDbContext dbContext)
    {
        _unitOfWork = unitOfWork;
        _dbContext = dbContext;
    }

    public async Task<List<FieldDto>> GetAllAsync()
    {
        var fields = await _dbContext.LearningFields
            .Include(f => f.Playlists).ThenInclude(p => p.Videos).ThenInclude(v => v.Progress)
            .OrderBy(f => f.Name)
            .ToListAsync();

        return fields.Select(MapField).ToList();
    }

    public async Task<FieldDto?> GetByIdAsync(int id)
    {
        var field = await _dbContext.LearningFields
            .Include(f => f.Playlists).ThenInclude(p => p.Videos).ThenInclude(v => v.Progress)
            .FirstOrDefaultAsync(f => f.Id == id);

        return field == null ? null : MapField(field);
    }

    public async Task<FieldDto> CreateAsync(CreateFieldDto dto)
    {
        var field = new LearningField
        {
            Name = dto.Name,
            Description = dto.Description,
            Color = dto.Color ?? "#6366f1",
            Icon = dto.Icon
        };

        await _unitOfWork.LearningFields.AddAsync(field);
        await _unitOfWork.SaveChangesAsync();

        return MapField(field);
    }

    public async Task<FieldDto?> UpdateAsync(int id, UpdateFieldDto dto)
    {
        var field = await _unitOfWork.LearningFields.GetByIdAsync(id);
        if (field == null) return null;

        field.Name = dto.Name;
        field.Description = dto.Description;
        field.Color = dto.Color ?? field.Color;
        field.Icon = dto.Icon;
        field.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.LearningFields.UpdateAsync(field);
        await _unitOfWork.SaveChangesAsync();

        // Reload with related data
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(int id)
    {
        var field = await _unitOfWork.LearningFields.GetByIdAsync(id);
        if (field != null)
        {
            await _unitOfWork.LearningFields.RemoveAsync(field);
            await _unitOfWork.SaveChangesAsync();
        }
    }

    private static FieldDto MapField(LearningField f)
    {
        var videos = f.Playlists.SelectMany(p => p.Videos).ToList();
        return new FieldDto(
            f.Id, f.Name, f.Description, f.Color, f.Icon, f.CreatedAt,
            f.Playlists.Count,
            videos.Count,
            videos.Count(v => v.Progress?.Status == VideoStatus.Completed),
            videos.Sum(v => v.DurationSeconds),
            videos.Sum(v => v.Progress?.WatchedSeconds ?? 0)
        );
    }
}
