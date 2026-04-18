
using EssLearn.Application.Dtos;

namespace EssLearn.Core.Interfaces;

public interface IImportService
{
    Task<ImportResultDto> ImportPlaylistAsync(ImportPlaylistDto dto);
}
