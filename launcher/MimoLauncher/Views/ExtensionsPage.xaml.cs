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
        
        HooksCount.Text = status.HooksCount.ToString();
        ToolsCount.Text = status.ToolsCount.ToString();
        SkillsCount.Text = status.SkillsCount.ToString();
        RulesCount.Text = status.RulesCount.ToString();
        WorkflowsCount.Text = status.WorkflowsCount.ToString();
        TuiCount.Text = status.TuiCount.ToString();
        TotalText.Text = $"Total: {status.TotalCount} components";
        
        StatusMessage.Text = status.IsInstalled ? "Extensions installed" : "Extensions not installed";
    }
    
    private async void Install_Click(object sender, RoutedEventArgs e)
    {
        await RunOperationAsync("Installing...", async (progress) =>
        {
            return await _extensionsService.InstallAsync(progress);
        });
    }
    
    private async void Update_Click(object sender, RoutedEventArgs e)
    {
        await RunOperationAsync("Updating...", async (progress) =>
        {
            return await _extensionsService.UpdateAsync(progress);
        });
    }
    
    private async void UpdateMcp_Click(object sender, RoutedEventArgs e)
    {
        await RunOperationAsync("Updating MCP servers...", async (progress) =>
        {
            return await _extensionsService.UpdateMcpAsync(progress);
        });
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
            await RunOperationAsync("Uninstalling...", async (progress) =>
            {
                return await _extensionsService.UninstallAsync(progress);
            });
        }
    }
    
    private async Task RunOperationAsync(string message, Func<IProgress<string>, Task<bool>> operation)
    {
        StatusMessage.Text = message;
        ProgressRing.IsActive = true;
        
        var progress = new Progress<string>(msg =>
        {
            StatusMessage.Text = msg;
        });
        
        var success = await operation(progress);
        
        ProgressRing.IsActive = false;
        StatusMessage.Text = success ? "Operation complete" : "Operation failed";
        
        await RefreshStatus();
    }
}
