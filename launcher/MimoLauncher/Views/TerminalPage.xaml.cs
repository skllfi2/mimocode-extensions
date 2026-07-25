using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using Microsoft.UI.Xaml.Input;
using MimoLauncher.Services;

namespace MimoLauncher.Views;

public sealed partial class TerminalPage : Page
{
    private readonly TerminalService _terminal;
    
    public TerminalPage()
    {
        InitializeComponent();
        _terminal = new TerminalService();
        _terminal.OutputReceived += OnOutputReceived;
        _terminal.ProcessExited += OnProcessExited;
    }
    
    private void OnLoaded(object sender, RoutedEventArgs e)
    {
        // Page loaded
    }
    
    private void OnUnloaded(object sender, RoutedEventArgs e)
    {
        _terminal.Stop();
    }
    
    private void OnOutputReceived(object? sender, string output)
    {
        DispatcherQueue.TryEnqueue(() =>
        {
            OutputText.Text += output;
            // Scroll to bottom
            OutputScrollViewer.ChangeView(0, OutputScrollViewer.ExtentHeight, 0);
        });
    }
    
    private void OnProcessExited(object? sender, EventArgs e)
    {
        DispatcherQueue.TryEnqueue(() =>
        {
            StatusText.Text = "Stopped";
            StartButton.IsEnabled = true;
            StopButton.IsEnabled = false;
        });
    }
    
    private async void StartButton_Click(object sender, RoutedEventArgs e)
    {
        try
        {
            StatusText.Text = "Starting...";
            StartButton.IsEnabled = false;
            
            await _terminal.StartAsync();
            
            StatusText.Text = "Running";
            StopButton.IsEnabled = true;
            InputBox.Focus(FocusState.Programmatic);
        }
        catch (Exception ex)
        {
            StatusText.Text = $"Error: {ex.Message}";
            StartButton.IsEnabled = true;
        }
    }
    
    private void StopButton_Click(object sender, RoutedEventArgs e)
    {
        _terminal.Stop();
        StatusText.Text = "Stopped";
        StartButton.IsEnabled = true;
        StopButton.IsEnabled = false;
    }
    
    private void ClearButton_Click(object sender, RoutedEventArgs e)
    {
        OutputText.Text = string.Empty;
    }
    
    private async void RunButton_Click(object sender, RoutedEventArgs e)
    {
        await SendCommand();
    }
    
    private async void InputBox_KeyDown(object sender, KeyRoutedEventArgs e)
    {
        if (e.Key == Windows.System.VirtualKey.Enter)
        {
            await SendCommand();
        }
    }
    
    private async Task SendCommand()
    {
        var command = InputBox.Text.Trim();
        if (string.IsNullOrEmpty(command) || !_terminal.IsRunning) return;
        
        OutputText.Text += $"PS> {command}\n";
        await _terminal.SendCommandAsync(command);
        InputBox.Text = string.Empty;
    }
    
    public void SetWorkingDirectory(string path)
    {
        _terminal.SetWorkingDirectory(path);
    }
}
