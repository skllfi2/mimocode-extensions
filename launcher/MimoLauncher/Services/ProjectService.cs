using System.Text.Json;
using MimoLauncher.Models;

namespace MimoLauncher.Services;

public class ProjectService
{
    private readonly string _configPath;
    private LauncherConfig _config;

    public ProjectService()
    {
        _configPath = Path.Combine(AppContext.BaseDirectory, "projects.json");
        _config = LoadConfig();
    }

    public List<Project> GetAllProjects() => _config.Projects;

    public List<Project> SearchProjects(string query)
    {
        if (string.IsNullOrWhiteSpace(query))
            return _config.Projects;

        return _config.Projects
            .Where(p => p.Name.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                       p.Description.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                       p.Category.Contains(query, StringComparison.OrdinalIgnoreCase))
            .ToList();
    }

    public void AddProject(Project project)
    {
        _config.Projects.Add(project);
        SaveConfig();
    }

    public void UpdateProject(string name, Project updatedProject)
    {
        var index = _config.Projects.FindIndex(p => p.Name == name);
        if (index >= 0)
        {
            _config.Projects[index] = updatedProject;
            SaveConfig();
        }
    }

    public void DeleteProject(string name)
    {
        _config.Projects.RemoveAll(p => p.Name == name);
        SaveConfig();
    }

    public void UpdateLastUsed(string name)
    {
        var project = _config.Projects.FirstOrDefault(p => p.Name == name);
        if (project != null)
        {
            var updated = project with { LastUsed = DateTime.Now.ToString("yyyy-MM-dd") };
            UpdateProject(name, updated);
        }
    }

    public AppSettings GetSettings() => _config.Settings;

    private LauncherConfig LoadConfig()
    {
        if (File.Exists(_configPath))
        {
            var json = File.ReadAllText(_configPath);
            return JsonSerializer.Deserialize<LauncherConfig>(json) ?? new LauncherConfig();
        }
        return new LauncherConfig();
    }

    private void SaveConfig()
    {
        var options = new JsonSerializerOptions { WriteIndented = true };
        var json = JsonSerializer.Serialize(_config, options);
        File.WriteAllText(_configPath, json);
    }
}
