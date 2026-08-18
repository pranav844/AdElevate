using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers with case-insensitive JSON options
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

// Configure CORS (Allow React and Spring Boot to communicate freely)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure Kestrel to run on Port 5050
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5050);
});

var app = builder.Build();

app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

Console.WriteLine("=================================================");
Console.WriteLine(" 🚀 MS.NET Logger Microservice running on Port 5050");
Console.WriteLine(" Log Endpoint:   POST http://localhost:5050/api/log");
Console.WriteLine(" Get Logs:       GET  http://localhost:5050/api/log");
Console.WriteLine(" Health Check:   GET  http://localhost:5050/api/log/health");
Console.WriteLine("=================================================");

app.Run();
