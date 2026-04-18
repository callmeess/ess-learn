
using EssLearn.Application.Dtos;

namespace EssLearn.Core.Interfaces;


public interface IFieldService
{
    Task<List<FieldDto>> GetAllAsync();
    Task<FieldDto?> GetByIdAsync(int id);
    Task<FieldDto> CreateAsync(CreateFieldDto dto);
    Task<FieldDto?> UpdateAsync(int id, UpdateFieldDto dto);
    Task DeleteAsync(int id);
}
