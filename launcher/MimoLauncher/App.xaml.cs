using System;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.UI;
using Microsoft.UI.Xaml;
using MimoLauncher.Services;
using MimoLauncher.ViewModels;
using Windows.UI.ViewManagement;

namespace MimoLauncher;

public partial class App : Application
{
    private static IServiceProvider? _serviceProvider;

    public App()
    {
        InitializeComponent();
        ConfigureServices();
        ApplySystemTheme();
    }

    private void ConfigureServices()
    {
        var services = new ServiceCollection();

        // Register services
        services.AddSingleton<ProjectService>();
        services.AddSingleton<LocalizationService>();

        // Register ViewModels
        services.AddTransient<MainViewModel>();

        _serviceProvider = services.BuildServiceProvider();
    }

    private void ApplySystemTheme()
    {
        // Get system theme
        var settings = new UISettings();
        var systemTheme = settings.GetColorValue(UIColorType.Background);
        
        // Apply theme based on system setting
        if (systemTheme.R == 0 && systemTheme.G == 0 && systemTheme.B == 0)
        {
            // Dark theme
            RequestedTheme = ApplicationTheme.Dark;
        }
        else
        {
            // Light theme
            RequestedTheme = ApplicationTheme.Light;
        }
    }

    public static T GetService<T>() where T : class
    {
        return _serviceProvider?.GetService<T>()
            ?? throw new InvalidOperationException($"Service {typeof(T)} not found");
    }

    protected override void OnLaunched(LaunchActivatedEventArgs args)
    {
        var window = new MainWindow();
        window.Activate();
    }
}
