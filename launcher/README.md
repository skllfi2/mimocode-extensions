# MiMoCode Launcher

Unified control center for MiMoCode projects and extensions.

## Features

### Projects Tab
- **Project List**: View all projects with name, description, category
- **Search**: Filter projects by name, description, category
- **Launch MiMoCode**: Open MiMoCode in selected project directory
- **Open in Terminal**: Open integrated terminal in project directory
- **Add/Delete Projects**: Manage project list

### Terminal Tab
- **Integrated PowerShell**: Native terminal experience
- **Command Execution**: Run commands directly in the launcher
- **Project Context**: Terminal opens in selected project directory

### Extensions Tab
- **Install**: Install MiMoCode extensions from GitHub
- **Update**: Update extensions to latest version
- **Update MCP**: Update MCP servers only
- **Uninstall**: Remove all extensions
- **Status**: View installed component counts

## Installation

### Prerequisites
- Windows 10/11
- .NET 10 SDK
- Windows App SDK Runtime

### Build and Run

```powershell
cd F:\Development\mimocode-extensions-update\launcher\MimoLauncher
dotnet run
```

### Install Windows App SDK Runtime

Download and install from:
```
https://aka.ms/windowsappsdk/1.8/1.8.260709004/windowsappruntimeinstaller-x64.exe
```

## Project Structure

```
launcher/
├── MimoLauncher.slnx           # Solution file
├── MimoLauncher/               # WinUI 3 application
│   ├── App.xaml(.cs)           # Application entry
│   ├── MainWindow.xaml(.cs)    # Main window with TabView
│   ├── Views/
│   │   ├── MainPage.xaml(.cs)  # Projects tab
│   │   ├── TerminalPage.xaml(.cs) # Terminal tab
│   │   └── ExtensionsPage.xaml(.cs) # Extensions tab
│   ├── ViewModels/
│   │   └── MainViewModel.cs    # Main ViewModel
│   ├── Models/
│   │   ├── Project.cs          # Project model
│   │   ├── AppSettings.cs      # Settings model
│   │   └── LauncherConfig.cs   # Configuration model
│   ├── Services/
│   │   ├── ProjectService.cs   # Project management
│   │   ├── TerminalService.cs  # PowerShell terminal
│   │   ├── ExtensionsService.cs # Extension management
│   │   └── LocalizationService.cs # Localization
│   ├── Styles/
│   │   └── DesignSystem.xaml   # Fluent Design styles
│   ├── Themes/
│   │   ├── Dark.xaml           # Dark theme
│   │   └── Light.xaml         # Light theme
│   └── Strings/
│       ├── ru/Resources.resw   # Russian localization
│       ├── en/Resources.resw   # English localization
│       └── en-US/Resources.resw # Default language
├── setup.ps1                   # PowerShell installer
├── setup.sh                    # Bash installer
└── projects.json               # Project database
```

## Configuration

Projects are stored in `projects.json`:

```json
{
  "projects": [
    {
      "name": "MyProject",
      "path": "C:\\path\\to\\project",
      "description": "Project description",
      "category": "Desktop",
      "favorite": false,
      "lastUsed": "2026-07-25"
    }
  ],
  "settings": {
    "theme": "system",
    "language": "system"
  }
}
```

## Localization

The launcher supports Russian and English. Language is detected from system settings.

To add new languages:
1. Create `Strings/<language>/Resources.resw`
2. Add translations
3. Update `LocalizationService.cs`

## Development

### Build

```powershell
dotnet build
```

### Run

```powershell
dotnet run
```

### Publish

```powershell
dotnet publish -c Release
```

## License

MIT
