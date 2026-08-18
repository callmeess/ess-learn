
using EssLearn.Application.Dtos;

namespace EssLearn.Application.Interfaces;

public interface IImportService
{

    Task<ImportResultDto> ImportVideoAsync(ImportVideoDto dto);
    Task<ImportResultDto> ImportPlaylistAsync(ImportPlaylistDto dto);
}
