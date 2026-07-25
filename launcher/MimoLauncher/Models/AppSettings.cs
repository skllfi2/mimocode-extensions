using System.Text.Json.Serialization;

namespace MimoLauncher.Models;

public record AppSettings
{
    [JsonPropertyName("theme")]
    public string Theme { get; init; } = "dark";

    [JsonPropertyName("showRecent")]
    public bool ShowRecent { get; init; } = true;

    [JsonPropertyName("recentCount")]
    public int RecentCount { get; init; } = 5;

    [JsonPropertyName("autoRefresh")]
    public bool AutoRefresh { get; init; } = true;
}
