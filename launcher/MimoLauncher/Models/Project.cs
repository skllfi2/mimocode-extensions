using System.Text.Json.Serialization;

namespace MimoLauncher.Models;

public record Project
{
    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("path")]
    public string Path { get; init; } = string.Empty;

    [JsonPropertyName("description")]
    public string Description { get; init; } = string.Empty;

    [JsonPropertyName("category")]
    public string Category { get; init; } = "Other";

    [JsonPropertyName("favorite")]
    public bool Favorite { get; init; }

    [JsonPropertyName("lastUsed")]
    public string LastUsed { get; init; } = string.Empty;
}
