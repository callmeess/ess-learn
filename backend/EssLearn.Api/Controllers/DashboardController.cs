using EssLearn.Application.Dtos;
using EssLearn.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController(IDashboardService dashboardService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<DashboardDto>> Get([FromQuery] string? range = null)
    {
        var dashboard = await dashboardService.GetAsync(range);
        return Ok(dashboard);
    }
}
