using Microsoft.Extensions.DependencyInjection;
using Microsoft.UI.Xaml;
using MimoLauncher.Services;
using MimoLauncher.ViewModels;

namespace MimoLauncher;

public partial class App : Application
{
    private static IServiceProvider? _serviceProvider;

    public App()
    {
        InitializeComponent();
        ConfigureServices();
    }

    private void ConfigureServices()
    {
        var services = new ServiceCollection();
        
        // Register services
        services.AddSingleton<ProjectService>();
        
        // Register ViewModels
        services.AddTransient<MainViewModel>();
        
        _serviceProvider = services.BuildServiceProvider();
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
