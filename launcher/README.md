# MiMoCode Project Launcher

A PowerShell GUI launcher for managing and launching MiMoCode projects.

## Features

- **Project List**: View all projects with name, description, category, and last used date
- **Search**: Filter projects by name, description, or category
- **Add Project**: Add new projects to the list
- **Launch MiMoCode**: Open MiMoCode in the selected project directory
- **Open Folder**: Open project folder in Explorer
- **Edit/Delete**: Manage project entries
- **Recent Tracking**: Automatically tracks last used date

## Installation

No installation required. Just run the PowerShell script:

```powershell
.\mimo-launcher.ps1
```

## Usage

1. **Launch the launcher**:
   ```powershell
   cd F:\Development\mimocode-extensions\launcher
   .\mimo-launcher.ps1
   ```

2. **Select a project** from the list

3. **Click "Launch MiMoCode"** to open MiMoCode in that directory

4. **Add new projects** using the "+ Add Project" button

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
    "theme": "dark",
    "showRecent": true,
    "recentCount": 5
  }
}
```

## Adding Projects

### Via GUI
1. Click "+ Add Project"
2. Enter project name and path
3. Click "Add"

### Via JSON
Edit `projects.json` directly:

```json
{
  "name": "NewProject",
  "path": "F:\\Development\\NewProject",
  "description": "My new project",
  "category": "Desktop",
  "favorite": false,
  "lastUsed": ""
}
```

## Categories

- **Desktop**: WinUI 3, WPF, WinForms applications
- **Web**: Web applications and sites
- **Mobile**: Mobile applications
- **Gaming**: Game-related projects
- **Development**: Development tools and libraries
- **Other**: Uncategorized projects

## Keyboard Shortcuts

- **Enter**: Launch MiMoCode for selected project
- **Delete**: Delete selected project
- **Ctrl+F**: Focus search box
- **Ctrl+N**: Add new project

## Future Enhancements

- [ ] Edit project details dialog
- [ ] Drag and drop project folders
- [ ] Import/export project lists
- [ ] Git integration (status, commit)
- [ ] Token usage statistics
- [ ] Project templates
- [ ] Auto-discover projects in directories
