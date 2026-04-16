using EssLearn.Api.Dtos;

namespace EssLearn.Core.Interfaces;

/// <summary>
/// Service for managing videos and their progress.
/// </summary>
public interface IVideoService
{
    /// <summary>
    /// Gets all videos with optional filtering by playlist or field.
    /// </summary>
    Task<List<VideoListItemDto>> GetAllAsync(int? playlistId = null, int? fieldId = null);

    /// <summary>
    /// Gets a specific video by ID.
    /// </summary>
    Task<VideoDto?> GetByIdAsync(int id);

    /// <summary>
    /// Updates video watching progress.
    /// </summary>
    Task<ProgressDto?> UpdateProgressAsync(int id, UpdateProgressDto dto);

    /// <summary>
    /// Gets the progress for a video.
    /// </summary>
    Task<ProgressDto> GetProgressAsync(int id);
}
