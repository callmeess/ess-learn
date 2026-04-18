using EssLearn.Application.Dtos;

namespace EssLearn.Core.Interfaces;


public interface IDashboardService
{
    Task<DashboardDto> GetAsync();
}
