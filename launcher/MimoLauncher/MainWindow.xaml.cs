using Microsoft.UI.Xaml;
using MimoLauncher.Views;

namespace MimoLauncher;

public sealed partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();

        // Set window title
        Title = "MiMoCode Launcher";
    }
    
    public void NavigateToTerminal(string? workingDirectory = null)
    {
        // Switch to terminal tab
        MainTabView.SelectedIndex = 1;
        
        // Set working directory if provided
        if (TerminalPage != null && !string.IsNullOrEmpty(workingDirectory))
        {
            TerminalPage.SetWorkingDirectory(workingDirectory);
        }
    }
}
