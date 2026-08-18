using EssLearn.Application.Dtos;

namespace EssLearn.Application.Interfaces;


public interface IDashboardService
{
    Task<DashboardDto> GetAsync(string? range = null);
}
