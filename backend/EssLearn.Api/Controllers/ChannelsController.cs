using EssLearn.Application.Dtos;
using EssLearn.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChannelsController(IChannelService channelService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<ChannelListItemDto>>> GetAll()
    {
        var channels = await channelService.GetAllAsync();
        return Ok(channels);
    }
}
