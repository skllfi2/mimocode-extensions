using System.Text.Json.Serialization;

namespace MimoLauncher.Models;

public record LauncherConfig
{
    [JsonPropertyName("projects")]
    public List<Project> Projects { get; init; } = [];

    [JsonPropertyName("settings")]
    public AppSettings Settings { get; init; } = new();
}
