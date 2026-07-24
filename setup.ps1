# MiMoCode Extensions - Universal Installer & Updater (PowerShell)
# Usage: .\setup.ps1 [command]
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
# CONFIGURATION
# ============================================

$RepoUrl = "https://github.com/skllfi2/mimocode-extensions.git"
$MimoHome = if ($env:MIMO_HOME) { $env:MIMO_HOME } else { "$env:USERPROFILE\.config\mimocode" }
$MimoTarget = "$MimoHome\.mimocode"
$BackupDir = "$MimoHome\.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

# ============================================
# FUNCTIONS
# ============================================

function Write-Header {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║     MiMoCode Extensions - Universal Installer          ║" -ForegroundColor Blue
    Write-Host "║     Version 2.0.0                                       ║" -ForegroundColor Blue
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
}

function Write-Step {
    param([int]$Step, [string]$Message)
    Write-Host "[$Step/5] $Message" -ForegroundColor Green
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
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
    if (Test-Path $MimoTarget) {
        Write-Host "Backing up existing installation..."
        New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
        Copy-Item -Path $MimoTarget -Destination $BackupDir -Recurse -Force
        Write-Success "Backup created at $BackupDir"
    }
}

function Clone-Repo {
    $tempDir = Join-Path $env:TEMP "mimocode-extensions-$(Get-Random)"
    Write-Host "Cloning repository..."
    
    try {
        git clone --depth 1 $RepoUrl $tempDir 2>$null
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
    
    # Create directories
    $dirs = @("hooks", "rules", "skills", "workflows", "tui", "mcp", "tools")
    foreach ($dir in $dirs) {
        New-Item -ItemType Directory -Force -Path "$MimoTarget\$dir" | Out-Null
    }
    
    # Copy hooks
    if (Test-Path "$SourceDir\hooks") {
        Copy-Item -Path "$SourceDir\hooks\*" -Destination "$MimoTarget\hooks\" -Recurse -Force
        $count = (Get-ChildItem "$MimoTarget\hooks\*.ts" -ErrorAction SilentlyContinue).Count
        Write-Success "Hooks: $count installed"
    }
    
    # Copy tools
    if (Test-Path "$SourceDir\tools") {
        Copy-Item -Path "$SourceDir\tools\*" -Destination "$MimoTarget\tools\" -Recurse -Force
        $count = (Get-ChildItem "$MimoTarget\tools\*.ts" -ErrorAction SilentlyContinue).Count
        Write-Success "Tools: $count installed"
    }
    
    # Copy skills
    if (Test-Path "$SourceDir\skills") {
        Copy-Item -Path "$SourceDir\skills\*" -Destination "$MimoTarget\skills\" -Recurse -Force
        $count = (Get-ChildItem "$MimoTarget\skills" -Directory -ErrorAction SilentlyContinue).Count
        Write-Success "Skills: $count installed"
    }
    
    # Copy rules
    if (Test-Path "$SourceDir\rules") {
        Copy-Item -Path "$SourceDir\rules\*" -Destination "$MimoTarget\rules\" -Recurse -Force
        $count = (Get-ChildItem "$MimoTarget\rules\*.md" -ErrorAction SilentlyContinue).Count
        Write-Success "Rules: $count installed"
    }
    
    # Copy workflows
    if (Test-Path "$SourceDir\workflows") {
        Copy-Item -Path "$SourceDir\workflows\*" -Destination "$MimoTarget\workflows\" -Recurse -Force
        $count = (Get-ChildItem "$MimoTarget\workflows\*.js" -ErrorAction SilentlyContinue).Count
        Write-Success "Workflows: $count installed"
    }
    
    # Copy TUI plugins
    if (Test-Path "$SourceDir\tui") {
        Copy-Item -Path "$SourceDir\tui\*" -Destination "$MimoTarget\tui\" -Recurse -Force
        $count = (Get-ChildItem "$MimoTarget\tui\*.tsx" -ErrorAction SilentlyContinue).Count
        Write-Success "TUI Plugins: $count installed"
    }
    
    # Copy MCP configs
    if (Test-Path "$SourceDir\mcp") {
        Copy-Item -Path "$SourceDir\mcp\*" -Destination "$MimoTarget\mcp\" -Recurse -Force
        Write-Success "MCP configs installed"
    }
    
    # Copy plugin.ts
    if (Test-Path "$SourceDir\plugin.ts") {
        Copy-Item -Path "$SourceDir\plugin.ts" -Destination "$MimoTarget\" -Force
        Write-Success "Plugin entry installed"
    }
    
    # Copy package.json
    if (Test-Path "$SourceDir\package.json") {
        Copy-Item -Path "$SourceDir\package.json" -Destination "$MimoTarget\" -Force
        Write-Success "Package.json installed"
    }
}

function Install-McpServers {
    Write-Host ""
    Write-Host "Installing MCP servers..."
    
    $servers = @(
        "@modelcontextprotocol/server-filesystem",
        "@modelcontextprotocol/server-memory",
        "@modelcontextprotocol/server-github",
        "@modelcontextprotocol/server-sequential-thinking",
        "@modelcontextprotocol/server-postgres",
        "@modelcontextprotocol/server-puppeteer"
    )
    
    $success = 0
    $failed = 0
    
    foreach ($server in $servers) {
        $name = $server.Split("/")[-1]
        Write-Host "  Installing $name... " -NoNewline
        try {
            npm install -g $server 2>$null | Out-Null
            Write-Host "✓" -ForegroundColor Green
            $success++
        }
        catch {
            Write-Host "⚠ (will use npx)" -ForegroundColor Yellow
            $failed++
        }
    }
    
    Write-Host ""
    Write-Success "MCP servers: $success installed, $failed will use npx"
}

function New-Config {
    $configFile = "$MimoHome\mimocode.jsonc"
    
    if (-not (Test-Path $configFile)) {
        Write-Host "Creating default configuration..."
        
        $config = @'
{
  "$schema": "https://mimo.xiaomi.com/mimocode/config.json",
  
  "model": "opencode-go/mimo-v2.5",
  
  "provider": {
    "opencode-go": {
      "baseURL": "https://opencode.ai/zen/go/v1",
      "apiKey": "YOUR_API_KEY_HERE"
    }
  },
  
  "model_groups": {
    "lite": "opencode-go/deepseek-v4-flash",
    "standard": "opencode-go/mimo-v2.5",
    "ultra": "opencode-go/glm-5.2"
  },
  
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem"]
    },
    "memory": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-memory"]
    },
    "github": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
      "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token" }
    },
    "sequential-thinking": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "postgres": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
      "env": { "DATABASE_URL": "postgresql://user:pass@localhost/db" }
    },
    "puppeteer": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-puppeteer"]
    }
  },
  
  "skills": {
    "paths": ["~/.config/mimocode/.mimocode/skills"]
  },
  
  "dream": { "auto": true, "interval_days": 3 },
  "distill": { "auto": true, "interval_days": 7 },
  
  "checkpoint": {
    "thresholds": ["40%", "60%", "80%"],
    "task_archive_days": 14
  },
  
  "compaction": {
    "auto": true,
    "prune": true,
    "tail_turns": 3,
    "preserve_recent_tokens": 8000
  },
  
  "experimental": {
    "maxMode": { "candidates": 3 },
    "predict_next_prompt": true,
    "token_efficiency_heuristic": true
  },
  
  "autoupdate": "notify",
  "logLevel": "warn",
  "instructions": "Answer in Russian. Write code comments in Russian. Be concise."
}
'@
        
        $config | Out-File -FilePath $configFile -Encoding UTF8
        Write-Success "Configuration created at $configFile"
        Write-Warning "Edit $configFile to add your API keys"
    }
    else {
        Write-Warning "Configuration already exists, skipping"
    }
}

function Show-Status {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║     MiMoCode Extensions Status                         ║" -ForegroundColor Blue
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
    
    if (-not (Test-Path $MimoTarget)) {
        Write-Error "Extensions not installed"
        return
    }
    
    # Count components
    $hooks = (Get-ChildItem "$MimoTarget\hooks\*.ts" -ErrorAction SilentlyContinue).Count
    $tools = (Get-ChildItem "$MimoTarget\tools\*.ts" -ErrorAction SilentlyContinue).Count
    $skills = (Get-ChildItem "$MimoTarget\skills" -Directory -ErrorAction SilentlyContinue).Count
    $rules = (Get-ChildItem "$MimoTarget\rules\*.md" -ErrorAction SilentlyContinue).Count
    $workflows = (Get-ChildItem "$MimoTarget\workflows\*.js" -ErrorAction SilentlyContinue).Count
    $tui = (Get-ChildItem "$MimoTarget\tui\*.tsx" -ErrorAction SilentlyContinue).Count
    
    Write-Host "Installed Components:"
    Write-Host "  Hooks:       $hooks"
    Write-Host "  Tools:       $tools"
    Write-Host "  Skills:      $skills"
    Write-Host "  Rules:       $rules"
    Write-Host "  Workflows:   $workflows"
    Write-Host "  TUI Plugins: $tui"
    Write-Host "  ─────────────────"
    Write-Host "  Total:       $($hooks + $tools + $skills + $rules + $workflows + $tui)"
    Write-Host ""
    
    # Check MCP servers
    Write-Host "MCP Servers:"
    $mcpCount = 0
    foreach ($server in @("filesystem", "memory", "github", "sequential-thinking", "postgres", "puppeteer")) {
        $installed = npm list -g "@modelcontextprotocol/server-$server" 2>$null | Select-String "@modelcontextprotocol"
        if ($installed) {
            Write-Host "  $server: ✓ installed" -ForegroundColor Green
            $mcpCount++
        }
        else {
            Write-Host "  $server: ⚠ npx fallback" -ForegroundColor Yellow
        }
    }
    Write-Host "  ─────────────────"
    Write-Host "  Total: $mcpCount installed, $(6 - $mcpCount) npx fallback"
    Write-Host ""
    
    # Check config
    if (Test-Path "$MimoHome\mimocode.jsonc") {
        Write-Host "Configuration: ✓ exists" -ForegroundColor Green
    }
    else {
        Write-Host "Configuration: ✗ missing" -ForegroundColor Red
    }
}

function Remove-Extensions {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
    Write-Host "║     Uninstalling MiMoCode Extensions                   ║" -ForegroundColor Yellow
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
    Write-Host ""
    
    $confirm = Read-Host "Are you sure you want to uninstall? (y/N)"
    
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "Uninstall cancelled"
        return
    }
    
    if (Test-Path $MimoTarget) {
        Backup-Existing
        Remove-Item -Path $MimoTarget -Recurse -Force
        Write-Success "Extensions removed"
    }
    else {
        Write-Warning "Extensions not found"
    }
}

# ============================================
# MAIN COMMANDS
# ============================================

function Invoke-Install {
    Write-Header
    Write-Host "Installing MiMoCode Extensions..."
    Write-Host ""
    
    Test-Dependencies
    Set-NpmConfig
    
    Write-Step 1 "Backing up existing installation"
    Backup-Existing
    
    Write-Step 2 "Cloning repository"
    $tempDir = Clone-Repo
    
    Write-Step 3 "Installing extensions"
    Install-Extensions $tempDir
    
    Write-Step 4 "Installing MCP servers"
    Install-McpServers
    
    Write-Step 5 "Creating configuration"
    New-Config
    
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║     Installation Complete!                             ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "  1. Edit $MimoHome\mimocode.jsonc with your API keys"
    Write-Host "  2. Restart MiMoCode"
    Write-Host "  3. Enjoy 80% cost savings!"
    Write-Host ""
}

function Invoke-Update {
    Write-Header
    Write-Host "Updating MiMoCode Extensions..."
    Write-Host ""
    
    Test-Dependencies
    Set-NpmConfig
    
    Write-Step 1 "Backing up current installation"
    Backup-Existing
    
    Write-Step 2 "Cloning latest version"
    $tempDir = Clone-Repo
    
    Write-Step 3 "Updating extensions"
    Install-Extensions $tempDir
    
    Write-Step 4 "Updating MCP servers"
    Install-McpServers
    
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║     Update Complete!                                   ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "Restart MiMoCode to use the updated extensions."
    Write-Host ""
}

function Invoke-UpdateMcp {
    Write-Header
    Write-Host "Updating MCP servers..."
    Write-Host ""
    
    Test-Dependencies
    Set-NpmConfig
    
    Install-McpServers
    
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║     MCP Update Complete!                               ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
}

# ============================================
# ENTRY POINT
# ============================================

Write-Header

switch ($Command) {
    "install" {
        Invoke-Install
    }
    "update" {
        Invoke-Update
    }
    "update:mcp" {
        Invoke-UpdateMcp
    }
    "status" {
        Show-Status
    }
    "uninstall" {
        Remove-Extensions
    }
    default {
        Write-Host "Usage: .\setup.ps1 [command]"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  install     - Fresh install (default)"
        Write-Host "  update      - Update from GitHub"
        Write-Host "  update:mcp  - Update MCP servers only"
        Write-Host "  status      - Show installed components"
        Write-Host "  uninstall   - Remove all extensions"
    }
}
