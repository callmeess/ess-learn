using EssLearn.Application.Dtos;

namespace EssLearn.Application.Interfaces;

public interface IChannelService
{
    Task<List<ChannelListItemDto>> GetAllAsync();
}
