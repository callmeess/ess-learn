using EssLearn.Api.Dtos;

namespace EssLearn.Core.Interfaces;

/// <summary>
/// Service for importing playlists and videos from external sources.
/// </summary>
public interface IImportService
{
    /// <summary>
    /// Imports a YouTube playlist with all its videos.
    /// </summary>
    Task<ImportResultDto> ImportPlaylistAsync(ImportPlaylistDto dto);
}
