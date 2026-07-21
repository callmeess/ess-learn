
using EssLearn.Application.Dtos;

namespace EssLearn.Core.Interfaces;

public interface IImportService
{

    Task<ImportResultDto> ImportVideoAsync(ImportVideoDto dto);
    Task<ImportResultDto> ImportPlaylistAsync(ImportPlaylistDto dto);
}
