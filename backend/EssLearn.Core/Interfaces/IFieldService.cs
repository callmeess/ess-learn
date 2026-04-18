using EssLearn.Api.Dtos;

namespace EssLearn.Core.Interfaces;

/// <summary>
/// Service for managing learning fields and their statistics.
/// </summary>
public interface IFieldService
{
    /// <summary>
    /// Gets all learning fields with their associated data.
    /// </summary>
    Task<List<FieldDto>> GetAllAsync();

    /// <summary>
    /// Gets a specific field by ID with all its playlists and videos.
    /// </summary>
    Task<FieldDto?> GetByIdAsync(int id);

    /// <summary>
    /// Creates a new learning field.
    /// </summary>
    Task<FieldDto> CreateAsync(CreateFieldDto dto);

    /// <summary>
    /// Updates an existing learning field.
    /// </summary>
    Task<FieldDto?> UpdateAsync(int id, UpdateFieldDto dto);

    /// <summary>
    /// Deletes a learning field by ID.
    /// </summary>
    Task DeleteAsync(int id);
}
