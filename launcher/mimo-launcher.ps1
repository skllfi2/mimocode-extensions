# MiMoCode Project Launcher
# PowerShell GUI for managing and launching MiCode projects

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

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
        return Get-Content $ConfigPath -Raw | ConvertFrom-Json
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
# CREATE FORM
# ============================================

$form = New-Object System.Windows.Forms.Form
$form.Text = "MiMoCode Project Launcher"
$form.Size = New-Object System.Drawing.Size(800, 600)
$form.StartPosition = "CenterScreen"
$form.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$form.ForeColor = [System.Drawing.Color]::White

# ============================================
# HEADER
# ============================================

$titleLabel = New-Object System.Windows.Forms.Label
$titleLabel.Text = "MiMoCode Project Launcher"
$titleLabel.Font = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
$titleLabel.ForeColor = [System.Drawing.Color]::White
$titleLabel.AutoSize = $true
$titleLabel.Location = New-Object System.Drawing.Point(20, 20)
$form.Controls.Add($titleLabel)

# ============================================
# SEARCH BOX
# ============================================

$searchLabel = New-Object System.Windows.Forms.Label
$searchLabel.Text = "Search:"
$searchLabel.ForeColor = [System.Drawing.Color]::White
$searchLabel.AutoSize = $true
$searchLabel.Location = New-Object System.Drawing.Point(20, 70)
$form.Controls.Add($searchLabel)

$searchBox = New-Object System.Windows.Forms.TextBox
$searchBox.Size = New-Object System.Drawing.Size(300, 25)
$searchBox.Location = New-Object System.Drawing.Point(80, 67)
$searchBox.BackColor = [System.Drawing.Color]::FromArgb(45, 45, 45)
$searchBox.ForeColor = [System.Drawing.Color]::White
$form.Controls.Add($searchBox)

# ============================================
# LIST VIEW
# ============================================

$listView = New-Object System.Windows.Forms.ListView
$listView.Size = New-Object System.Drawing.Size(740, 350)
$listView.Location = New-Object System.Drawing.Size(20, 110)
$listView.View = "Details"
$listView.FullRowSelect = $true
$listView.GridLines = $true
$listView.BackColor = [System.Drawing.Color]::FromArgb(37, 37, 37)
$listView.ForeColor = [System.Drawing.Color]::White

# Add columns
$listView.Columns.Add("Name", 150)
$listView.Columns.Add("Description", 250)
$listView.Columns.Add("Category", 100)
$listView.Columns.Add("Last Used", 100)
$listView.Columns.Add("Path", 200)

$form.Controls.Add($listView)

# ============================================
# BUTTONS
# ============================================

$buttonY = 480

$addButton = New-Object System.Windows.Forms.Button
$addButton.Text = "+ Add Project"
$addButton.Size = New-Object System.Drawing.Size(120, 35)
$addButton.Location = New-Object System.Drawing.Point(20, $buttonY)
$addButton.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 212)
$addButton.ForeColor = [System.Drawing.Color]::White
$addButton.FlatStyle = "Flat"
$form.Controls.Add($addButton)

$launchButton = New-Object System.Windows.Forms.Button
$launchButton.Text = "Launch MiMoCode"
$launchButton.Size = New-Object System.Drawing.Size(150, 35)
$launchButton.Location = New-Object System.Drawing.Point(150, $buttonY)
$launchButton.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 212)
$launchButton.ForeColor = [System.Drawing.Color]::White
$launchButton.FlatStyle = "Flat"
$launchButton.Enabled = $false
$form.Controls.Add($launchButton)

$openFolderButton = New-Object System.Windows.Forms.Button
$openFolderButton.Text = "Open Folder"
$openFolderButton.Size = New-Object System.Drawing.Size(120, 35)
$openFolderButton.Location = New-Object System.Drawing.Point(310, $buttonY)
$openFolderButton.BackColor = [System.Drawing.Color]::FromArgb(60, 60, 60)
$openFolderButton.ForeColor = [System.Drawing.Color]::White
$openFolderButton.FlatStyle = "Flat"
$openFolderButton.Enabled = $false
$form.Controls.Add($openFolderButton)

$deleteButton = New-Object System.Windows.Forms.Button
$deleteButton.Text = "Delete"
$deleteButton.Size = New-Object System.Drawing.Size(80, 35)
$deleteButton.Location = New-Object System.Drawing.Point(440, $buttonY)
$deleteButton.BackColor = [System.Drawing.Color]::FromArgb(60, 60, 60)
$deleteButton.ForeColor = [System.Drawing.Color]::Red
$deleteButton.FlatStyle = "Flat"
$deleteButton.Enabled = $false
$form.Controls.Add($deleteButton)

$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = "Ready"
$statusLabel.ForeColor = [System.Drawing.Color]::Gray
$statusLabel.AutoSize = $true
$statusLabel.Location = New-Object System.Drawing.Point(540, ($buttonY + 10))
$form.Controls.Add($statusLabel)

# ============================================
# LOAD PROJECTS
# ============================================

$config = Load-Projects

function Refresh-List {
    param($Filter = "")
    $listView.Items.Clear()
    foreach ($project in $config.projects) {
        if ($Filter -eq "" -or $project.name -like "*$Filter*" -or $project.description -like "*$Filter*") {
            $item = New-Object System.Windows.Forms.ListViewItem($project.name)
            $item.SubItems.Add($project.description)
            $item.SubItems.Add($project.category)
            $item.SubItems.Add($project.lastUsed)
            $item.SubItems.Add($project.path)
            $item.Tag = $project
            $listView.Items.Add($item)
        }
    }
}

Refresh-List

# ============================================
# EVENT HANDLERS
# ============================================

$searchBox.Add_TextChanged({
    Refresh-List $searchBox.Text
})

$listView.Add_SelectedIndexChanged({
    if ($listView.SelectedItems.Count -gt 0) {
        $launchButton.Enabled = $true
        $openFolderButton.Enabled = $true
        $deleteButton.Enabled = $true
        $statusLabel.Text = "Selected: $($listView.SelectedItems[0].Text)"
    } else {
        $launchButton.Enabled = $false
        $openFolderButton.Enabled = $false
        $deleteButton.Enabled = $false
        $statusLabel.Text = "Ready"
    }
})

$launchButton.Add_Click({
    if ($listView.SelectedItems.Count -gt 0) {
        $project = $listView.SelectedItems[0].Tag
        $statusLabel.Text = "Launching MiMoCode in $($project.name)..."
        
        Update-LastUsed $config $project.name
        
        Start-Process -FilePath "powershell" -ArgumentList "-NoExit -Command `"cd '$($project.path)'; $MimoCommand`""
        
        $statusLabel.Text = "Launched MiMoCode in $($project.name)"
    }
})

$openFolderButton.Add_Click({
    if ($listView.SelectedItems.Count -gt 0) {
        $project = $listView.SelectedItems[0].Tag
        if (Test-Path $project.path) {
            Start-Process explorer.exe $project.path
        }
    }
})

$addButton.Add_Click({
    $addForm = New-Object System.Windows.Forms.Form
    $addForm.Text = "Add Project"
    $addForm.Size = New-Object System.Drawing.Size(400, 250)
    $addForm.StartPosition = "CenterParent"
    $addForm.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
    $addForm.ForeColor = [System.Drawing.Color]::White
    
    $nameLabel = New-Object System.Windows.Forms.Label
    $nameLabel.Text = "Name:"
    $nameLabel.Location = New-Object System.Drawing.Point(20, 20)
    $nameLabel.AutoSize = $true
    $addForm.Controls.Add($nameLabel)
    
    $nameBox = New-Object System.Windows.Forms.TextBox
    $nameBox.Size = New-Object System.Drawing.Size(340, 25)
    $nameBox.Location = New-Object System.Drawing.Point(20, 45)
    $addForm.Controls.Add($nameBox)
    
    $pathLabel = New-Object System.Windows.Forms.Label
    $pathLabel.Text = "Path:"
    $pathLabel.Location = New-Object System.Drawing.Point(20, 80)
    $pathLabel.AutoSize = $true
    $addForm.Controls.Add($pathLabel)
    
    $pathBox = New-Object System.Windows.Forms.TextBox
    $pathBox.Size = New-Object System.Drawing.Size(340, 25)
    $pathBox.Location = New-Object System.Drawing.Point(20, 105)
    $addForm.Controls.Add($pathBox)
    
    $browseButton = New-Object System.Windows.Forms.Button
    $browseButton.Text = "Browse"
    $browseButton.Size = New-Object System.Drawing.Size(80, 25)
    $browseButton.Location = New-Object System.Drawing.Point(280, 105)
    $browseButton.Add_Click({
        $folderBrowser = New-Object System.Windows.Forms.FolderBrowserDialog
        if ($folderBrowser.ShowDialog() -eq "OK") {
            $pathBox.Text = $folderBrowser.SelectedPath
        }
    })
    $addForm.Controls.Add($browseButton)
    
    $okButton = New-Object System.Windows.Forms.Button
    $okButton.Text = "Add"
    $okButton.Size = New-Object System.Drawing.Size(80, 30)
    $okButton.Location = New-Object System.Drawing.Point(200, 160)
    $okButton.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 212)
    $okButton.ForeColor = [System.Drawing.Color]::White
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
            Refresh-List
            $statusLabel.Text = "Added: $($nameBox.Text)"
            $addForm.Close()
        }
    })
    $addForm.Controls.Add($okButton)
    
    $cancelButton = New-Object System.Windows.Forms.Button
    $cancelButton.Text = "Cancel"
    $cancelButton.Size = New-Object System.Drawing.Size(80, 30)
    $cancelButton.Location = New-Object System.Drawing.Point(290, 160)
    $cancelButton.BackColor = [System.Drawing.Color]::FromArgb(60, 60, 60)
    $cancelButton.ForeColor = [System.Drawing.Color]::White
    $cancelButton.Add_Click({ $addForm.Close() })
    $addForm.Controls.Add($cancelButton)
    
    $addForm.ShowDialog() | Out-Null
})

$deleteButton.Add_Click({
    if ($listView.SelectedItems.Count -gt 0) {
        $project = $listView.SelectedItems[0].Tag
        $result = [System.Windows.Forms.MessageBox]::Show(
            "Delete project '$($project.name)' from list?",
            "Confirm Delete",
            "YesNo",
            "Question"
        )
        
        if ($result -eq "Yes") {
            $config.projects = $config.projects | Where-Object { $_.name -ne $project.name }
            Save-Projects $config
            Refresh-List
            $statusLabel.Text = "Deleted: $($project.name)"
        }
    }
})

# ============================================
# SHOW FORM
# ============================================

$form.ShowDialog() | Out-Null
