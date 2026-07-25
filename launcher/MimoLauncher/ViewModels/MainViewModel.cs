using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using MimoLauncher.Models;
using MimoLauncher.Services;

namespace MimoLauncher.ViewModels;

public partial class MainViewModel : ObservableObject
{
    private readonly ProjectService _projectService;
    private List<Project> _allProjects = [];

    [ObservableProperty]
    private ObservableCollection<Project> _projects = [];

    [ObservableProperty]
    private Project? _selectedProject;

    [ObservableProperty]
    private string _searchText = string.Empty;

    [ObservableProperty]
    private string _statusText = "Ready";

    public MainViewModel(ProjectService projectService)
    {
        _projectService = projectService;
        LoadProjects();
    }

    private void LoadProjects()
    {
        _allProjects = _projectService.GetAllProjects();
        RefreshProjects();
    }

    private void RefreshProjects()
    {
        var filtered = string.IsNullOrWhiteSpace(SearchText)
            ? _allProjects
            : _allProjects.Where(p =>
                p.Name.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                p.Description.Contains(SearchText, StringComparison.OrdinalIgnoreCase) ||
                p.Category.Contains(SearchText, StringComparison.OrdinalIgnoreCase))
            .ToList();

        Projects.Clear();
        foreach (var project in filtered)
        {
            Projects.Add(project);
        }
    }

    [RelayCommand]
    private void Search()
    {
        RefreshProjects();
    }

    [RelayCommand]
    private void LaunchMiMoCode()
    {
        if (SelectedProject == null) return;

        StatusText = $"Launching MiMoCode in {SelectedProject.Name}...";
        _projectService.UpdateLastUsed(SelectedProject.Name);

        var startInfo = new System.Diagnostics.ProcessStartInfo
        {
            FileName = "powershell",
            Arguments = $"-NoExit -Command \"cd '{SelectedProject.Path}'; mimo\"",
            UseShellExecute = false
        };

        System.Diagnostics.Process.Start(startInfo);
        StatusText = $"Launched MiMoCode in {SelectedProject.Name}";
    }

    [RelayCommand]
    private void OpenFolder()
    {
        if (SelectedProject == null || !Directory.Exists(SelectedProject.Path))
            return;

        System.Diagnostics.Process.Start("explorer.exe", SelectedProject.Path);
    }

    [RelayCommand]
    private void AddProject()
    {
        StatusText = "Add project dialog coming soon...";
    }

    [RelayCommand]
    private void DeleteProject()
    {
        if (SelectedProject == null) return;

        _projectService.DeleteProject(SelectedProject.Name);
        StatusText = $"Deleted: {SelectedProject.Name}";
        LoadProjects();
    }

    partial void OnSearchTextChanged(string value)
    {
        RefreshProjects();
    }

    partial void OnSelectedProjectChanged(Project? value)
    {
        StatusText = value != null ? $"Selected: {value.Name}" : "Ready";
    }
}
