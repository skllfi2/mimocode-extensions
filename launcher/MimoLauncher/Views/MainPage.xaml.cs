using Microsoft.UI.Xaml;
using Microsoft.UI.Xaml.Controls;
using MimoLauncher.ViewModels;

namespace MimoLauncher.Views;

public sealed partial class MainPage : Page
{
    public MainViewModel ViewModel { get; }

    public MainPage()
    {
        InitializeComponent();
        ViewModel = App.GetService<MainViewModel>();
        DataContext = ViewModel;
    }

    private void OnLoaded(object sender, RoutedEventArgs e)
    {
        // Page loaded
    }

    private void SearchBox_QuerySubmitted(AutoSuggestBox sender, AutoSuggestBoxQuerySubmittedEventArgs args)
    {
        ViewModel.SearchCommand.Execute(null);
    }

    private void ProjectList_ItemClick(object sender, ItemClickEventArgs e)
    {
        if (e.ClickedItem is Models.Project project)
        {
            ViewModel.SelectedProject = project;
        }
    }

    private void ProjectList_SelectionChanged(object sender, SelectionChangedEventArgs e)
    {
        if (ProjectList.SelectedItem is Models.Project project)
        {
            ViewModel.SelectedProject = project;
        }
    }

    private void AddProject_Click(object sender, RoutedEventArgs e)
    {
        ViewModel.AddProjectCommand.Execute(null);
    }

    private void LaunchMiMoCode_Click(object sender, RoutedEventArgs e)
    {
        ViewModel.LaunchMiMoCodeCommand.Execute(null);
    }

    private void OpenFolder_Click(object sender, RoutedEventArgs e)
    {
        ViewModel.OpenFolderCommand.Execute(null);
    }

    private void DeleteProject_Click(object sender, RoutedEventArgs e)
    {
        ViewModel.DeleteProjectCommand.Execute(null);
    }

    private void OpenInTerminal_Click(object sender, RoutedEventArgs e)
    {
        if (ViewModel.SelectedProject == null) return;

        // Get the main window and navigate to terminal
        var mainWindow = Window.Current as MainWindow;
        mainWindow?.NavigateToTerminal(ViewModel.SelectedProject.Path);
    }
}
