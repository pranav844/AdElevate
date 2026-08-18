using Microsoft.AspNetCore.Mvc;
using LoggerService.Models;
using System.Collections.Concurrent;
using System.Text.Json;

namespace LoggerService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LogController : ControllerBase
    {
        private static readonly ConcurrentQueue<LogEntry> LogBuffer = new();
        private static readonly object FileLock = new();
        private const int MaxMemoryLogs = 200;
        private static readonly string LogFilePath = Path.Combine(Directory.GetCurrentDirectory(), "logs", "adelevate_activity.log");

        public LogController()
        {
            var logDir = Path.Combine(Directory.GetCurrentDirectory(), "logs");
            if (!Directory.Exists(logDir))
            {
                Directory.CreateDirectory(logDir);
            }
        }

        [HttpPost]
        public IActionResult PostLog([FromBody] JsonElement rawBody)
        {
            var entry = new LogEntry
            {
                Id = Guid.NewGuid().ToString(),
                Timestamp = DateTime.UtcNow
            };

            try
            {
                if (rawBody.ValueKind == JsonValueKind.Object)
                {
                    if (rawBody.TryGetProperty("serviceName", out var s) || rawBody.TryGetProperty("ServiceName", out s))
                        entry.ServiceName = s.GetString() ?? "SpringBootBackend";

                    if (rawBody.TryGetProperty("logLevel", out var l) || rawBody.TryGetProperty("LogLevel", out l))
                        entry.LogLevel = l.GetString() ?? "INFO";

                    if (rawBody.TryGetProperty("action", out var a) || rawBody.TryGetProperty("Action", out a))
                        entry.Action = a.GetString() ?? "GENERAL";

                    if (rawBody.TryGetProperty("message", out var m) || rawBody.TryGetProperty("Message", out m))
                        entry.Message = m.GetString() ?? "Activity recorded";

                    if (rawBody.TryGetProperty("userId", out var u) || rawBody.TryGetProperty("UserId", out u))
                        entry.UserId = u.GetString() ?? "GUEST";
                }
            }
            catch (Exception ex)
            {
                entry.Message = "Raw log payload: " + rawBody.ToString();
            }

            if (string.IsNullOrWhiteSpace(entry.Message))
            {
                entry.Message = $"Activity recorded [{entry.Action}]";
            }

            // Store in memory queue
            LogBuffer.Enqueue(entry);
            while (LogBuffer.Count > MaxMemoryLogs)
            {
                LogBuffer.TryDequeue(out _);
            }

            // Write to log file
            string logFormatted = $"[{entry.Timestamp:yyyy-MM-dd HH:mm:ss}] [{entry.LogLevel}] [{entry.ServiceName}] [User: {entry.UserId ?? "N/A"}] [Action: {entry.Action}] - {entry.Message}{Environment.NewLine}";

            lock (FileLock)
            {
                System.IO.File.AppendAllText(LogFilePath, logFormatted);
            }

            Console.WriteLine($"📥 Log Received: [{entry.LogLevel}] [{entry.Action}] {entry.Message}");

            return Ok(new { status = "Logged", id = entry.Id });
        }

        [HttpGet]
        public IActionResult GetLogs([FromQuery] string? serviceName, [FromQuery] string? logLevel)
        {
            var query = LogBuffer.AsEnumerable();

            if (!string.IsNullOrWhiteSpace(serviceName))
            {
                query = query.Where(l => l.ServiceName.Equals(serviceName, StringComparison.OrdinalIgnoreCase));
            }

            if (!string.IsNullOrWhiteSpace(logLevel))
            {
                query = query.Where(l => l.LogLevel.Equals(logLevel, StringComparison.OrdinalIgnoreCase));
            }

            return Ok(query.OrderByDescending(l => l.Timestamp).ToList());
        }

        [HttpGet("health")]
        public IActionResult Health()
        {
            return Ok(new
            {
                status = "UP",
                service = "MS.NET Logger Microservice",
                timestamp = DateTime.UtcNow,
                totalLogsInMemory = LogBuffer.Count
            });
        }
    }
}
