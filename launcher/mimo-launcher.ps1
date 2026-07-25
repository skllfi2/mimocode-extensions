# MiMoCode Project Launcher
# PowerShell GUI for managing and launching MiCode projects

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

# ============================================
# CONFIGURATION
# ============================================

$ConfigPath = "$PSScriptRoot\projects.json"
$MimoCommand = "mimo"

# ============================================
# FUNCTIONS
# ============================================

function Load-Projects {
    if (Test-Path $ConfigPath) {
        return Get-Content $ConfigPath | ConvertFrom-Json
    } else {
        return @{ projects = @(); settings = @{ theme = "dark"; showRecent = $true; recentCount = 5 } }
    }
}

function Save-Projects {
    param($Config)
    $Config | ConvertTo-Json -Depth 10 | Set-Content $ConfigPath
}

function Update-LastUsed {
    param($Config, $ProjectName)
    $project = $Config.projects | Where-Object { $_.name -eq $ProjectName }
    if ($project) {
        $project.lastUsed = Get-Date -Format "yyyy-MM-dd"
    }
    Save-Projects $Config
}

# ============================================
# XAML GUI
# ============================================

[xml]$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="MiMoCode Project Launcher"
        Height="600" Width="800"
        WindowStartupLocation="CenterScreen"
        Background="#1e1e1e">
    
    <Window.Resources>
        <Style x:Key="DarkButton" TargetType="Button">
            <Setter Property="Background" Value="#3c3c3c"/>
            <Setter Property="Foreground" Value="#ffffff"/>
            <Setter Property="BorderThickness" Value="0"/>
            <Setter Property="Padding" Value="15,8"/>
            <Setter Property="Margin" Value="5"/>
            <Setter Property="Cursor" Value="Hand"/>
        </Style>
        <Style x:Key="AccentButton" TargetType="Button">
            <Setter Property="Background" Value="#0078d4"/>
            <Setter Property="Foreground" Value="#ffffff"/>
            <Setter Property="BorderThickness" Value="0"/>
            <Setter Property="Padding" Value="15,8"/>
            <Setter Property="Margin" Value="5"/>
            <Setter Property="Cursor" Value="Hand"/>
        </Style>
    </Window.Resources>
    
    <Grid Margin="10">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>
        
        <!-- Header -->
        <StackPanel Grid.Row="0" Margin="0,0,0,10">
            <TextBlock Text="MiMoCode Project Launcher" 
                       FontSize="24" FontWeight="Bold" 
                       Foreground="#ffffff" Margin="0,0,0,10"/>
            
            <!-- Search and Actions -->
            <Grid>
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="Auto"/>
                    <ColumnDefinition Width="Auto"/>
                    <ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>
                
                <TextBox x:Name="SearchBox" 
                         Grid.Column="0"
                         PlaceholderText="Search projects..."
                         Background="#2d2d2d" Foreground="#ffffff"
                         BorderThickness="0" Padding="10,8"
                         Margin="0,0,5,0"/>
                
                <Button x:Name="AddButton" 
                        Grid.Column="1"
                        Content="+ Add Project"
                        Style="{StaticResource AccentButton}"
                        Click="AddProject_Click"/>
                
                <Button x:Name="RefreshButton" 
                        Grid.Column="2"
                        Content="Refresh"
                        Style="{StaticResource DarkButton}"
                        Click="Refresh_Click"/>
                
                <Button x:Name="SettingsButton" 
                        Grid.Column="3"
                        Content="Settings"
                        Style="{StaticResource DarkButton}"
                        Click="Settings_Click"/>
            </Grid>
        </StackPanel>
        
        <!-- Project List -->
        <ListView x:Name="ProjectList" 
                  Grid.Row="1"
                  Background="#252526"
                  Foreground="#ffffff"
                  BorderThickness="0"
                  SelectionChanged="ProjectList_SelectionChanged">
            <ListView.View>
                <GridView>
                    <GridViewColumn Header="Name" Width="150" DisplayMemberBinding="{Binding Name}"/>
                    <GridViewColumn Header="Description" Width="250" DisplayMemberBinding="{Binding Description}"/>
                    <GridViewColumn Header="Category" Width="100" DisplayMemberBinding="{Binding Category}"/>
                    <GridViewColumn Header="Last Used" Width="100" DisplayMemberBinding="{Binding LastUsed}"/>
                </GridView>
            </ListView.View>
        </ListView>
        
        <!-- Footer -->
        <StackPanel Grid.Row="2" Orientation="Horizontal" Margin="0,10,0,0">
            <Button x:Name="OpenFolderButton" 
                    Content="Open Folder"
                    Style="{StaticResource DarkButton}"
                    Click="OpenFolder_Click"
                    IsEnabled="False"/>
            
            <Button x:Name="EditButton" 
                    Content="Edit"
                    Style="{StaticResource DarkButton}"
                    Click="Edit_Click"
                    IsEnabled="False"/>
            
            <Button x:Name="DeleteButton" 
                    Content="Delete"
                    Style="{StaticResource DarkButton}"
                    Click="Delete_Click"
                    IsEnabled="False"
                    Foreground="#ff4444"/>
            
            <Button x:Name="LaunchButton" 
                    Content="Launch MiMoCode"
                    Style="{StaticResource AccentButton}"
                    Click="Launch_Click"
                    IsEnabled="False"/>
            
            <TextBlock x:Name="StatusText" 
                       Text="Ready"
                       Foreground="#888888"
                       VerticalAlignment="Center"
                       Margin="20,0,0,0"/>
        </StackPanel>
    </Grid>
</Window>
"@

# ============================================
# CREATE WINDOW
# ============================================

$reader = New-Object System.Xml.XmlNodeReader $xaml
$window = [Windows.Markup.XamlReader]::Load($reader)

# Get controls
$SearchBox = $window.FindName("SearchBox")
$ProjectList = $window.FindName("ProjectList")
$AddButton = $window.FindName("AddButton")
$RefreshButton = $window.FindName("RefreshButton")
$SettingsButton = $window.FindName("SettingsButton")
$OpenFolderButton = $window.FindName("OpenFolderButton")
$EditButton = $window.FindName("EditButton")
$DeleteButton = $window.FindName("DeleteButton")
$LaunchButton = $window.FindName("LaunchButton")
$StatusText = $window.FindName("StatusText")

# ============================================
# LOAD PROJECTS
# ============================================

$config = Load-Projects
$ProjectList.ItemsSource = $config.projects

# ============================================
# EVENT HANDLERS
# ============================================

$SearchBox.Add_TextChanged({
    $query = $SearchBox.Text.ToLower()
    if ([string]::IsNullOrEmpty($query)) {
        $ProjectList.ItemsSource = $config.projects
    } else {
        $filtered = $config.projects | Where-Object { 
            $_.name.ToLower().Contains($query) -or 
            $_.description.ToLower().Contains($query) -or
            $_.category.ToLower().Contains($query)
        }
        $ProjectList.ItemsSource = $filtered
    }
})

$ProjectList_SelectionChanged = {
    $selected = $ProjectList.SelectedItem
    if ($selected) {
        $OpenFolderButton.IsEnabled = $true
        $EditButton.IsEnabled = $true
        $DeleteButton.IsEnabled = $true
        $LaunchButton.IsEnabled = $true
        $StatusText.Text = "Selected: $($selected.name)"
    } else {
        $OpenFolderButton.IsEnabled = $false
        $EditButton.IsEnabled = $false
        $DeleteButton.IsEnabled = $false
        $LaunchButton.IsEnabled = $false
        $StatusText.Text = "Ready"
    }
}

$Refresh_Click = {
    $config = Load-Projects
    $ProjectList.ItemsSource = $config.projects
    $StatusText.Text = "Refreshed"
}

$AddProject_Click = {
    # Create add project dialog
    $addWindow = New-Object System.Windows.Window
    $addWindow.Title = "Add Project"
    $addWindow.Height = 300
    $addWindow.Width = 400
    $addWindow.WindowStartupLocation = "CenterOwner"
    $addWindow.Background = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.ColorConverter]::ConvertFromString("#1e1e1e"))
    
    $addGrid = New-Object System.Windows.Controls.Grid
    $addGrid.Margin = New-Object System.Windows.Thickness(10)
    
    # Add rows
    $addGrid.RowDefinitions.Add((New-Object System.Windows.Controls.RowDefinition))
    $addGrid.RowDefinitions.Add((New-Object System.Windows.Controls.RowDefinition))
    $addGrid.RowDefinitions.Add((New-Object System.Windows.Controls.RowDefinition))
    $addGrid.RowDefinitions.Add((New-Object System.Windows.Controls.RowDefinition))
    $addGrid.RowDefinitions.Add((New-Object System.Windows.Controls.RowDefinition))
    
    # Name
    $nameLabel = New-Object System.Windows.Controls.TextBlock
    $nameLabel.Text = "Name:"
    $nameLabel.Foreground = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.ColorConverter]::ConvertFromString("#ffffff"))
    [System.Windows.Controls.Grid]::SetRow($nameLabel, 0)
    $addGrid.Children.Add($nameLabel)
    
    $nameBox = New-Object System.Windows.Controls.TextBox
    $nameBox.Background = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.ColorConverter]::ConvertFromString("#2d2d2d"))
    $nameBox.Foreground = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.ColorConverter]::ConvertFromString("#ffffff"))
    $nameBox.Margin = New-Object System.Windows.Thickness(0,5,0,10)
    [System.Windows.Controls.Grid]::SetRow($nameBox, 1)
    $addGrid.Children.Add($nameBox)
    
    # Path
    $pathLabel = New-Object System.Windows.Controls.TextBlock
    $pathLabel.Text = "Path:"
    $pathLabel.Foreground = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.ColorConverter]::ConvertFromString("#ffffff"))
    [System.Windows.Controls.Grid]::SetRow($pathLabel, 2)
    $addGrid.Children.Add($pathLabel)
    
    $pathBox = New-Object System.Windows.Controls.TextBox
    $pathBox.Background = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.ColorConverter]::ConvertFromString("#2d2d2d"))
    $pathBox.Foreground = New-Object System.Windows.Media.SolidColorBrush([System.Windows.Media.ColorConverter]::ConvertFromString("#ffffff"))
    $pathBox.Margin = New-Object System.Windows.Thickness(0,5,0,10)
    [System.Windows.Controls.Grid]::SetRow($pathBox, 3)
    $addGrid.Children.Add($pathBox)
    
    # Buttons
    $buttonPanel = New-Object System.Windows.Controls.StackPanel
    $buttonPanel.Orientation = "Horizontal"
    $buttonPanel.HorizontalAlignment = "Right"
    [System.Windows.Controls.Grid]::SetRow($buttonPanel, 4)
    
    $okButton = New-Object System.Windows.Controls.Button
    $okButton.Content = "Add"
    $okButton.Style = $window.FindResource("AccentButton")
    $okButton.Add_Click({
        if ($nameBox.Text -and $pathBox.Text) {
            $newProject = @{
                name = $nameBox.Text
                path = $pathBox.Text
                description = ""
                category = "Other"
                favorite = $false
                lastUsed = ""
            }
            $config.projects += $newProject
            Save-Projects $config
            $ProjectList.ItemsSource = $config.projects
            $StatusText.Text = "Added: $($nameBox.Text)"
            $addWindow.Close()
        }
    })
    $buttonPanel.Children.Add($okButton)
    
    $cancelButton = New-Object System.Windows.Controls.Button
    $cancelButton.Content = "Cancel"
    $cancelButton.Style = $window.FindResource("DarkButton")
    $cancelButton.Add_Click({ $addWindow.Close() })
    $buttonPanel.Children.Add($cancelButton)
    
    $addGrid.Children.Add($buttonPanel)
    
    $addWindow.Content = $addGrid
    $addWindow.ShowDialog() | Out-Null
}

$Launch_Click = {
    $selected = $ProjectList.SelectedItem
    if ($selected) {
        $StatusText.Text = "Launching MiMoCode in $($selected.path)..."
        
        # Update last used
        Update-LastUsed $config $selected.name
        
        # Launch MiMoCode in new window
        Start-Process -FilePath "powershell" -ArgumentList "-NoExit -Command `"cd '$($selected.path)'; $MimoCommand`""
        
        $StatusText.Text = "Launched MiMoCode in $($selected.name)"
    }
}

$OpenFolder_Click = {
    $selected = $ProjectList.SelectedItem
    if ($selected -and (Test-Path $selected.path)) {
        Start-Process explorer.exe $selected.path
    }
}

$Edit_Click = {
    $selected = $ProjectList.SelectedItem
    if ($selected) {
        # Create edit dialog (similar to add)
        $StatusText.Text = "Edit: $($selected.name)"
    }
}

$Delete_Click = {
    $selected = $ProjectList.SelectedItem
    if ($selected) {
        $result = [System.Windows.MessageBox]::Show(
            "Delete project '$($selected.name)' from list?",
            "Confirm Delete",
            "YesNo",
            "Question"
        )
        
        if ($result -eq "Yes") {
            $config.projects = $config.projects | Where-Object { $_.name -ne $selected.name }
            Save-Projects $config
            $ProjectList.ItemsSource = $config.projects
            $StatusText.Text = "Deleted: $($selected.name)"
        }
    }
}

$Settings_Click = {
    $StatusText.Text = "Settings coming soon..."
}

# ============================================
# SHOW WINDOW
# ============================================

$window.ShowDialog() | Out-Null
