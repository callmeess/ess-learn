using EssLearn.Api.Dtos;

namespace EssLearn.Core.Interfaces;

/// <summary>
/// Service for retrieving dashboard statistics and summaries.
/// </summary>
public interface IDashboardService
{
    /// <summary>
    /// Gets dashboard with statistics about all fields, playlists, and videos.
    /// </summary>
    Task<DashboardDto> GetAsync();
}
