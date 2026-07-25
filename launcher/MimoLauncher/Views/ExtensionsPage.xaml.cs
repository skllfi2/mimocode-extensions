using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using MimoLauncher.Services;

namespace MimoLauncher.Views;

public sealed partial class ExtensionsPage : Page
{
    private readonly ExtensionsService _extensionsService;
    
    public ExtensionsPage()
    {
        InitializeComponent();
        _extensionsService = new ExtensionsService();
    }
    
    private async void OnLoaded(object sender, RoutedEventArgs e)
    {
        await RefreshStatus();
    }
    
    private async Task RefreshStatus()
    {
        var status = await _extensionsService.GetStatusAsync();
        StatusText.Text = status.IsInstalled 
            ? $"Installed: {status.TotalCount} components" 
            : "Not installed";
    }
    
    private async void Install_Click(object sender, RoutedEventArgs e)
    {
        ProgressRing.IsActive = true;
        StatusText.Text = "Installing...";
        
        var progress = new Progress<string>(msg => StatusText.Text = msg);
        var success = await _extensionsService.InstallAsync(progress);
        
        ProgressRing.IsActive = false;
        StatusText.Text = success ? "Installation complete" : "Installation failed";
        await RefreshStatus();
    }
    
    private async void Update_Click(object sender, RoutedEventArgs e)
    {
        ProgressRing.IsActive = true;
        StatusText.Text = "Updating...";
        
        var progress = new Progress<string>(msg => StatusText.Text = msg);
        var success = await _extensionsService.UpdateAsync(progress);
        
        ProgressRing.IsActive = false;
        StatusText.Text = success ? "Update complete" : "Update failed";
        await RefreshStatus();
    }
    
    private async void UpdateMcp_Click(object sender, RoutedEventArgs e)
    {
        ProgressRing.IsActive = true;
        StatusText.Text = "Updating MCP servers...";
        
        var progress = new Progress<string>(msg => StatusText.Text = msg);
        var success = await _extensionsService.UpdateMcpAsync(progress);
        
        ProgressRing.IsActive = false;
        StatusText.Text = success ? "MCP update complete" : "MCP update failed";
        await RefreshStatus();
    }
    
    private async void Uninstall_Click(object sender, RoutedEventArgs e)
    {
        var dialog = new ContentDialog
        {
            Title = "Confirm Uninstall",
            Content = "Are you sure you want to uninstall extensions?",
            PrimaryButtonText = "Uninstall",
            CloseButtonText = "Cancel",
            DefaultButton = ContentDialogButton.Close
        };
        
        var result = await dialog.ShowAsync();
        if (result == ContentDialogResult.Primary)
        {
            ProgressRing.IsActive = true;
            StatusText.Text = "Uninstalling...";
            
            var progress = new Progress<string>(msg => StatusText.Text = msg);
            var success = await _extensionsService.UninstallAsync(progress);
            
            ProgressRing.IsActive = false;
            StatusText.Text = success ? "Uninstall complete" : "Uninstall failed";
            await RefreshStatus();
        }
    }
}
