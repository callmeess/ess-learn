using EssLearn.Api.Dtos;

namespace EssLearn.Core.Interfaces;

/// <summary>
/// Service for managing playlists and their related data.
/// </summary>
public interface IPlaylistService
{
    /// <summary>
    /// Gets all playlists, optionally filtered by field.
    /// </summary>
    Task<List<PlaylistDto>> GetAllAsync(int? fieldId = null);

    /// <summary>
    /// Gets a playlist with all its videos by ID.
    /// </summary>
    Task<PlaylistDetailDto?> GetByIdAsync(int id);

    /// <summary>
    /// Deletes a playlist by ID.
    /// </summary>
    Task DeleteAsync(int id);
}
