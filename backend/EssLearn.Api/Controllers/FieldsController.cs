using EssLearn.Api.Dtos;
using EssLearn.Core.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EssLearn.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FieldsController(IFieldService fieldService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<FieldDto>>> GetAll()
    {
        var fields = await fieldService.GetAllAsync();
        return Ok(fields);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FieldDto>> Get(int id)
    {
        var field = await fieldService.GetByIdAsync(id);
        if (field is null) return NotFound();
        return Ok(field);
    }

    [HttpPost]
    public async Task<ActionResult<FieldDto>> Create(CreateFieldDto dto)
    {
        var field = await fieldService.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = field.Id }, field);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<FieldDto>> Update(int id, UpdateFieldDto dto)
    {
        var field = await fieldService.UpdateAsync(id, dto);
        if (field is null) return NotFound();
        return Ok(field);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await fieldService.DeleteAsync(id);
        return NoContent();
    }
}
