using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using dotnet.Models;

namespace dotnet.Controllers;

[ApiController]
[Route("[controller]")]
public class TodoController : ControllerBase
{
    private readonly IMongoCollection<Todo> _todos;
    private readonly ILogger<TodoController> _logger;

    public TodoController(ILogger<TodoController> logger, IMongoDatabase database)
    {
        _logger = logger;
        _todos = database.GetCollection<Todo>("todos");
    }

    [HttpPost]
    public async Task<ActionResult<Todo>> PostTodo([FromBody] Todo todo)
    {
        await _todos.InsertOneAsync(todo);
        return CreatedAtAction(nameof(GetTodos), todo);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Todo>>> GetTodos()
    {
        var todos = await _todos.Find(m => true).ToListAsync();
        return Ok(todos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Todo>> GetTodoById(string id)
    {
        var todo = await _todos.Find(todo => todo.Id == id).FirstAsync();
        return Ok(todo);
    }
}
