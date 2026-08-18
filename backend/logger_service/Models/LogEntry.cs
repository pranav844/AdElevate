using System.Text.Json.Serialization;

namespace LoggerService.Models
{
    public class LogEntry
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [JsonPropertyName("serviceName")]
        public string ServiceName { get; set; } = "SpringBootBackend";

        [JsonPropertyName("logLevel")]
        public string LogLevel { get; set; } = "INFO"; // INFO, WARN, ERROR

        [JsonPropertyName("message")]
        public string Message { get; set; } = string.Empty;

        [JsonPropertyName("action")]
        public string Action { get; set; } = string.Empty;

        [JsonPropertyName("userId")]
        public string? UserId { get; set; }

        [JsonPropertyName("timestamp")]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }
}
