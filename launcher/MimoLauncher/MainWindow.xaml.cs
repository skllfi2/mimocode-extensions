using Microsoft.UI.Xaml;
using MimoLauncher.Views;

namespace MimoLauncher;

public sealed partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        
        // Set title bar
        Title = "MiMoCode Launcher";
        
        // Navigate to main page
        ContentFrame.Navigate(typeof(MainPage));
    }
}
