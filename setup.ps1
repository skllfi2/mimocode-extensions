# MiMoCode Extensions - Universal Installer & Updater (PowerShell)
# Usage: irm https://raw.githubusercontent.com/skllfi2/mimocode-extensions/main/setup.ps1 | iex
#    or: .\setup.ps1 [command]
#
# Commands:
#   install     - Fresh install (default)
#   update      - Update from GitHub
#   update:mcp  - Update MCP servers only
#   status      - Show installed components
#   uninstall   - Remove all extensions

param(
    [Parameter(Position=0)]
    [ValidateSet("install", "update", "update:mcp", "status", "uninstall")]
    [string]$Command = "install"
)

# ============================================
# HANDLE IEX EXECUTION
# ============================================

if ($PSCommandPath -eq $null) {
    # Script is running via iex (no file path) - save to temp and re-run
    $tempScript = Join-Path $env:TEMP "mimocode-setup-temp.ps1"
    $scriptContent = $MyInvocation.MyCommand.Definition
    [System.IO.File]::WriteAllText($tempScript, $scriptContent, [System.Text.UTF8Encoding]::new($false))
    
    & $tempScript @args
    exit $LASTEXITCODE
}

# ============================================
# CONFIGURATION
# ============================================

$script:RepoUrl = "https://github.com/skllfi2/mimocode-extensions.git"
$script:MimoHome = if ($env:MIMO_HOME) { $env:MIMO_HOME } else { "$env:USERPROFILE\.config\mimocode" }
$script:MimoTarget = "$script:MimoHome\.mimocode"
$script:BackupDir = "$script:MimoHome\.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# ============================================
# FUNCTIONS
# ============================================

function Write-Header {
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Blue
    Write-Host "  MiMoCode Extensions - Universal Installer  " -ForegroundColor Blue
    Write-Host "  Version 2.0.0                               " -ForegroundColor Blue
    Write-Host "===============================================" -ForegroundColor Blue
    Write-Host ""
}

function Write-Step {
    param([int]$Step, [string]$Message)
    Write-Host "[$Step/5] $Message" -ForegroundColor Green
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[FAIL] $Message" -ForegroundColor Red
}

function Test-Dependencies {
    Write-Host "Checking dependencies..."
    
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error "git is not installed"
        exit 1
    }
    
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm is not installed"
        exit 1
    }
    
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "node is not installed"
        exit 1
    }
    
    Write-Success "All dependencies found"
}

function Set-NpmConfig {
    Write-Host "Fixing npm configuration..."
    npm config set allow-scripts true 2>$null
    Write-Success "npm configured"
}

function Backup-Existing {
    if (Test-Path $script:MimoTarget) {
        Write-Host "Backing up existing installation..."
        New-Item -ItemType Directory -Force -Path $script:BackupDir | Out-Null
        Copy-Item -Path $script:MimoTarget -Destination $script:BackupDir -Recurse -Force
        Write-Success "Backup created at $script:BackupDir"
    }
}

function Clone-Repo {
    $tempDir = Join-Path $env:TEMP "mimocode-extensions-$(Get-Random)"
    Write-Host "Cloning repository..."
    
    try {
        git clone --depth 1 $script:RepoUrl $tempDir 2>$null
        Write-Success "Repository cloned"
        return $tempDir
    }
    catch {
        Write-Error "Failed to clone repository"
        exit 1
    }
}

function Install-Extensions {
    param([string]$SourceDir)
    
    Write-Host "Installing extensions..."
    
    $dirs = @("hooks", "tools", "skills", "rules", "workflows", "tui", "mcp")
    foreach ($dir in $dirs) {
        $sourcePath = Join-Path $SourceDir $dir
        $targetPath = Join-Path $script:MimoTarget $dir
        
        if (Test-Path $sourcePath) {
            New-Item -ItemType Directory -Force -Path $targetPath | Out-Null
            Copy-Item -Path "$sourcePath\*" -Destination $targetPath -Recurse -Force
        }
    }
    
    # Copy plugin.ts and package.json
    if (Test-Path "$SourceDir\plugin.ts") {
        Copy-Item "$SourceDir\plugin.ts" "$script:MimoTarget\" -Force
    }
    if (Test-Path "$SourceDir\package.json") {
        Copy-Item "$SourceDir\package.json" "$script:MimoTarget\" -Force
    }
    
    Write-Success "Extensions installed"
}

function Get-Status {
    if (-not (Test-Path $script:MimoTarget)) {
        Write-Warning "Extensions not installed"
        return
    }
    
    $hooks = (Get-ChildItem "$script:MimoTarget\hooks\*.ts" -ErrorAction SilentlyContinue).Count
    $tools = (Get-ChildItem "$script:MimoTarget\tools\*.ts" -ErrorAction SilentlyContinue).Count
    $skills = (Get-ChildItem "$script:MimoTarget\skills" -Directory -ErrorAction SilentlyContinue).Count
    $rules = (Get-ChildItem "$script:MimoTarget\rules\*.md" -ErrorAction SilentlyContinue).Count
    $workflows = (Get-ChildItem "$script:MimoTarget\workflows\*.js" -ErrorAction SilentlyContinue).Count
    $tui = (Get-ChildItem "$script:MimoTarget\tui\*.tsx" -ErrorAction SilentlyContinue).Count
    
    Write-Host ""
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "  MiMoCode Extensions Status                  " -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Installed Components:" -ForegroundColor Green
    Write-Host "  Hooks:       $hooks"
    Write-Host "  Tools:       $tools"
    Write-Host "  Skills:      $skills"
    Write-Host "  Rules:       $rules"
    Write-Host "  Workflows:   $workflows"
    Write-Host "  TUI Plugins: $tui"
    Write-Host "-----------------------------------"
    Write-Host "  Total:       $($hooks + $tools + $skills + $rules + $workflows + $tui)" -ForegroundColor Yellow
}

# ============================================
# MAIN EXECUTION
# ============================================

Write-Header

switch ($Command) {
    "install" {
        Write-Step 1 "Checking dependencies"
        Test-Dependencies
        
        Write-Step 2 "Fixing npm configuration"
        Set-NpmConfig
        
        Write-Step 3 "Backing up existing installation"
        Backup-Existing
        
        Write-Step 4 "Cloning and installing extensions"
        $tempDir = Clone-Repo
        Install-Extensions -SourceDir $tempDir
        
        Write-Step 5 "Cleaning up"
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        
        Write-Host ""
        Write-Host "===============================================" -ForegroundColor Green
        Write-Host "  Installation Complete!                      " -ForegroundColor Green
        Write-Host "===============================================" -ForegroundColor Green
        Write-Host ""
        Get-Status
    }
    
    "update" {
        Write-Step 1 "Checking dependencies"
        Test-Dependencies
        
        Write-Step 2 "Fixing npm configuration"
        Set-NpmConfig
        
        Write-Step 3 "Backing up existing installation"
        Backup-Existing
        
        Write-Step 4 "Cloning and updating extensions"
        $tempDir = Clone-Repo
        Install-Extensions -SourceDir $tempDir
        
        Write-Step 5 "Cleaning up"
        Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
        
        Write-Host ""
        Write-Host "===============================================" -ForegroundColor Green
        Write-Host "  Update Complete!                            " -ForegroundColor Green
        Write-Host "===============================================" -ForegroundColor Green
        Write-Host ""
        Get-Status
    }
    
    "update:mcp" {
        Write-Host "Updating MCP servers..." -ForegroundColor Yellow
        $mcpDir = Join-Path $script:MimoTarget "mcp"
        if (Test-Path "$mcpDir\install-mcp.sh") {
            & bash "$mcpDir\install-mcp.sh"
        }
        Write-Host "MCP update complete!" -ForegroundColor Green
    }
    
    "status" {
        Get-Status
    }
    
    "uninstall" {
        if (Test-Path $script:MimoTarget) {
            Backup-Existing
            Remove-Item -Path $script:MimoTarget -Recurse -Force
            Write-Host "Extensions uninstalled!" -ForegroundColor Green
        } else {
            Write-Warning "Extensions not installed"
        }
    }
}

# Pause so the user can see the result
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
