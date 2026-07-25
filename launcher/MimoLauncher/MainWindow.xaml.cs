using Microsoft.UI.Xaml;
using MimoLauncher.Views;

namespace MimoLauncher;

public sealed partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        Title = "MiMoCode Launcher";
        
        // Navigate to main page
        ContentFrame.Navigate(typeof(MainPage));
    }

    public void NavigateToPage(System.Type pageType)
    {
        ContentFrame.Navigate(pageType);
    }
}
