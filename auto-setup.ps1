# MiMoCode Extensions - Fully Automated Installer (PowerShell)
# Usage: .\auto-setup.ps1
#
# This script will:
# 1. Check and install dependencies
# 2. Clone and install extensions
# 3. Install MCP servers
# 4. Configure OpenCode Go (optional)
# 5. Set up token optimization
# 6. Verify installation

# ============================================
# CONFIGURATION
# ============================================

$RepoUrl = "https://github.com/skllfi2/mimocode-extensions.git"
$MimoHome = if ($env:MIMO_HOME) { $env:MIMO_HOME } else { "$env:USERPROFILE\.config\mimocode" }
$MimoTarget = "$MimoHome\.mimocode"
$OpenCodeGoUrl = "https://opencode.ai"

# ============================================
# FUNCTIONS
# ============================================

function Write-Banner {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "║     MiMoCode Extensions - Fully Automated Installer          ║" -ForegroundColor Cyan
    Write-Host "║     Version 2.0.0                                            ║" -ForegroundColor Cyan
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([int]$Step, [string]$Message)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
    Write-Host "[$Step/7] $Message" -ForegroundColor Green
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Magenta
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✓ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  ⚠ $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "  ✗ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "  ℹ $Message" -ForegroundColor Blue
}

function Read-YesNo {
    param(
        [string]$Prompt,
        [bool]$Default = $true
    )
    
    if ($Default) {
        $promptText = "$Prompt [Y/n]: "
    } else {
        $promptText = "$Prompt [y/N]: "
    }
    
    $reply = Read-Host $promptText
    
    if ([string]::IsNullOrWhiteSpace($reply)) {
        return $Default
    }
    
    return $reply -match '^[Yy]$'
}

# ============================================
# STEP 1: Check Dependencies
# ============================================

function Test-Dependencies {
    Write-Step 1 "Checking dependencies"
    
    $missing = $false
    
    # Check git
    if (Get-Command git -ErrorAction SilentlyContinue) {
        $version = (git --version) -replace 'git version ', ''
        Write-Success "git $version"
    } else {
        Write-Error "git is not installed"
        Write-Info "Install: winget install Git.Git"
        $missing = $true
    }
    
    # Check node
    if (Get-Command node -ErrorAction SilentlyContinue) {
        $version = node --version
        Write-Success "node $version"
    } else {
        Write-Error "node is not installed"
        Write-Info "Install: https://nodejs.org/"
        $missing = $true
    }
    
    # Check npm
    if (Get-Command npm -ErrorAction SilentlyContinue) {
        $version = npm --version
        Write-Success "npm $version"
    } else {
        Write-Error "npm is not installed"
        Write-Info "Install: comes with node"
        $missing = $true
    }
    
    if ($missing) {
        Write-Host ""
        Write-Error "Missing required dependencies. Please install them first."
        exit 1
    }
    
    Write-Success "All dependencies satisfied"
}

# ============================================
# STEP 2: Fix npm Configuration
# ============================================

function Set-NpmConfig {
    Write-Step 2 "Fixing npm configuration"
    
    npm config set allow-scripts true 2>$null
    Write-Success "npm allow-scripts enabled"
    
    npm config set package-manager npm 2>$null
    Write-Success "npm configured"
}

# ============================================
# STEP 3: Backup Existing Installation
# ============================================

function Backup-Existing {
    Write-Step 3 "Backing up existing installation"
    
    if (Test-Path $MimoTarget) {
        $backupDir = "$MimoHome\.backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
        Copy-Item -Path $MimoTarget -Destination $backupDir -Recurse -Force
        Write-Success "Backup created at $backupDir"
    } else {
        Write-Info "No existing installation to backup"
    }
}

# ============================================
# STEP 4: Clone and Install Extensions
# ============================================

function Install-Extensions {
    Write-Step 4 "Installing extensions"
    
    $tempDir = Join-Path $env:TEMP "mimocode-extensions-$(Get-Random)"
    
    # Clone repository
    Write-Info "Cloning repository..."
    try {
        git clone --depth 1 $RepoUrl $tempDir 2>$null
        Write-Success "Repository cloned"
    }
    catch {
        Write-Error "Failed to clone repository"
        exit 1
    }
    
    # Create directories
    $dirs = @("hooks", "rules", "skills", "workflows", "tui", "mcp", "tools")
    foreach ($dir in $dirs) {
        New-Item -ItemType Directory -Force -Path "$MimoTarget\$dir" | Out-Null
    }
    
    # Copy hooks
    if (Test-Path "$tempDir\hooks") {
        Copy-Item -Path "$tempDir\hooks\*" -Destination "$MimoTarget\hooks\" -Recurse -Force
        $count = (Get-ChildItem "$MimoTarget\hooks\*.ts" -ErrorAction SilentlyContinue).Count
        Write-Success "Hooks: $count installed"
    }
    
    # Copy tools
    if (Test-Path "$tempDir\tools") {
        Copy-Item -Path "$tempDir\tools\*" -Destination "$MimoTarget\tools\" -Recurse -Force
        $count = (Get-ChildItem "$MimoTarget\tools\*.ts" -ErrorAction SilentlyContinue).Count
        Write-Success "Tools: $count installed"
    }
    
    # Copy skills
    if (Test-Path "$tempDir\skills") {
        Copy-Item -Path "$tempDir\skills\*" -Destination "$MimoTarget\skills\" -Recurse -Force
        $count = (Get-ChildItem "$MimoTarget\skills" -Directory -ErrorAction SilentlyContinue).Count
        Write-Success "Skills: $count installed"
    }
    
    # Copy rules
    if (Test-Path "$tempDir\rules") {
        Copy-Item -Path "$tempDir\rules\*" -Destination "$MimoTarget\rules\" -Recurse -Force
        $count = (Get-ChildItem "$MimoTarget\rules\*.md" -ErrorAction SilentlyContinue).Count
        Write-Success "Rules: $count installed"
    }
    
    # Copy workflows
    if (Test-Path "$tempDir\workflows") {
        Copy-Item -Path "$tempDir\workflows\*" -Destination "$MimoTarget\workflows\" -Recurse -Force
        $count = (Get-ChildItem "$MimoTarget\workflows\*.js" -ErrorAction SilentlyContinue).Count
        Write-Success "Workflows: $count installed"
    }
    
    # Copy TUI plugins
    if (Test-Path "$tempDir\tui") {
        Copy-Item -Path "$tempDir\tui\*" -Destination "$MimoTarget\tui\" -Recurse -Force
        $count = (Get-ChildItem "$MimoTarget\tui\*.tsx" -ErrorAction SilentlyContinue).Count
        Write-Success "TUI Plugins: $count installed"
    }
    
    # Copy MCP configs
    if (Test-Path "$tempDir\mcp") {
        Copy-Item -Path "$tempDir\mcp\*" -Destination "$MimoTarget\mcp\" -Recurse -Force
        Write-Success "MCP configs installed"
    }
    
    # Copy plugin.ts
    if (Test-Path "$tempDir\plugin.ts") {
        Copy-Item -Path "$tempDir\plugin.ts" -Destination "$MimoTarget\" -Force
        Write-Success "Plugin entry installed"
    }
    
    # Copy package.json
    if (Test-Path "$tempDir\package.json") {
        Copy-Item -Path "$tempDir\package.json" -Destination "$MimoTarget\" -Force
        Write-Success "Package.json installed"
    }
    
    # Cleanup
    Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
}

# ============================================
# STEP 5: Install MCP Servers
# ============================================

function Install-McpServers {
    Write-Step 5 "Installing MCP servers"
    
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

# ============================================
# STEP 6: Configure OpenCode Go (Optional)
# ============================================

function Configure-OpenCodeGo {
    Write-Step 6 "Configure OpenCode Go (Optional)"
    
    Write-Host ""
    Write-Host "OpenCode Go provides access to multiple AI models for `$10/month." -ForegroundColor Cyan
    Write-Host "This includes MiMo V2.5, DeepSeek V4 Flash, GLM-5.2, and more." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pricing:" -ForegroundColor Blue
    Write-Host "  - `$10/month for all models"
    Write-Host "  - `$60 usage limit per month"
    Write-Host "  - Save up to 80% vs other providers"
    Write-Host ""
    
    if (Read-YesNo "Do you want to configure OpenCode Go?") {
        Write-Host ""
        Write-Host "To get an API key:" -ForegroundColor Cyan
        Write-Host "  1. Visit $OpenCodeGoUrl"
        Write-Host "  2. Sign up for an account"
        Write-Host "  3. Subscribe to OpenCode Go (`$10/month)"
        Write-Host "  4. Go to Dashboard → API Keys → Create"
        Write-Host ""
        
        $apiKey = Read-Host "Enter your OpenCode Go API key (or press Enter to skip)"
        
        if (-not [string]::IsNullOrWhiteSpace($apiKey)) {
            New-ConfigWithKey $apiKey
            Write-Success "OpenCode Go configured"
        } else {
            Write-Info "Skipping OpenCode Go configuration"
            New-ConfigWithoutKey
        }
    } else {
        Write-Info "Skipping OpenCode Go configuration"
        New-ConfigWithoutKey
    }
}

# ============================================
# STEP 7: Create Configuration
# ============================================

function New-ConfigWithKey {
    param([string]$ApiKey)
    
    $configFile = "$MimoHome\mimocode.jsonc"
    
    $config = @"
{
  "`$schema": "https://mimo.xiaomi.com/mimocode/config.json",
  
  "model": "opencode-go/mimo-v2.5",
  
  "provider": {
    "opencode-go": {
      "baseURL": "https://opencode.ai/zen/go/v1",
      "apiKey": "$ApiKey"
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
"@
    
    $config | Out-File -FilePath $configFile -Encoding UTF8
    Write-Success "Configuration created with API key"
}

function New-ConfigWithoutKey {
    $configFile = "$MimoHome\mimocode.jsonc"
    
    if (-not (Test-Path $configFile)) {
        $config = @"
{
  "`$schema": "https://mimo.xiaomi.com/mimocode/config.json",
  
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
"@
        
        $config | Out-File -FilePath $configFile -Encoding UTF8
        Write-Success "Configuration created (edit to add API key)"
    } else {
        Write-Warning "Configuration already exists, skipping"
    }
}

# ============================================
# STEP 8: Verify Installation
# ============================================

function Test-Installation {
    Write-Step 7 "Verifying installation"
    
    $hooks = (Get-ChildItem "$MimoTarget\hooks\*.ts" -ErrorAction SilentlyContinue).Count
    $tools = (Get-ChildItem "$MimoTarget\tools\*.ts" -ErrorAction SilentlyContinue).Count
    $skills = (Get-ChildItem "$MimoTarget\skills" -Directory -ErrorAction SilentlyContinue).Count
    $rules = (Get-ChildItem "$MimoTarget\rules\*.md" -ErrorAction SilentlyContinue).Count
    $workflows = (Get-ChildItem "$MimoTarget\workflows\*.js" -ErrorAction SilentlyContinue).Count
    $tui = (Get-ChildItem "$MimoTarget\tui\*.tsx" -ErrorAction SilentlyContinue).Count
    $total = $hooks + $tools + $skills + $rules + $workflows + $tui
    
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                    Installation Summary                     ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Components Installed:" -ForegroundColor Green
    Write-Host "  Hooks:       $hooks"
    Write-Host "  Tools:       $tools"
    Write-Host "  Skills:      $skills"
    Write-Host "  Rules:       $rules"
    Write-Host "  Workflows:   $workflows"
    Write-Host "  TUI Plugins: $tui"
    Write-Host "  ─────────────────"
    Write-Host "  Total:       $total" -ForegroundColor Green
    Write-Host ""
    
    # Check MCP servers
    Write-Host "MCP Servers:" -ForegroundColor Green
    $mcpCount = 0
    foreach ($server in @("filesystem", "memory", "github", "sequential-thinking", "postgres", "puppeteer")) {
        $installed = npm list -g "@modelcontextprotocol/server-$server" 2>$null | Select-String "@modelcontextprotocol"
        if ($installed) {
            Write-Host "  $server: ✓ installed" -ForegroundColor Green
            $mcpCount++
        } else {
            Write-Host "  $server: ⚠ npx fallback" -ForegroundColor Yellow
        }
    }
    Write-Host "  ─────────────────"
    Write-Host "  Total: $mcpCount installed, $(6 - $mcpCount) npx fallback" -ForegroundColor Green
    Write-Host ""
    
    # Check config
    if (Test-Path "$MimoHome\mimocode.jsonc") {
        Write-Host "Configuration: ✓ exists" -ForegroundColor Green
    } else {
        Write-Host "Configuration: ✗ missing" -ForegroundColor Red
    }
    Write-Host ""
}

# ============================================
# PRINT FINAL INSTRUCTIONS
# ============================================

function Show-FinalInstructions {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "║                    Installation Complete!                    ║" -ForegroundColor Cyan
    Write-Host "║                                                              ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Next Steps:" -ForegroundColor Green
    Write-Host ""
    Write-Host "  1. Edit configuration:" -ForegroundColor Yellow
    Write-Host "     $MimoHome\mimocode.jsonc"
    Write-Host ""
    Write-Host "  2. Add your API key:" -ForegroundColor Yellow
    Write-Host "     Replace YOUR_API_KEY_HERE with your OpenCode Go API key"
    Write-Host ""
    Write-Host "  3. Restart MiMoCode:" -ForegroundColor Yellow
    Write-Host "     mimo"
    Write-Host ""
    
    Write-Host "Useful Commands:" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Check status:     .\setup.ps1 status"
    Write-Host "  Update:           .\setup.ps1 update"
    Write-Host "  Update MCP:       .\setup.ps1 update:mcp"
    Write-Host "  Uninstall:        .\setup.ps1 uninstall"
    Write-Host ""
    
    Write-Host "Cost Savings:" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Before: `$50/month (Xiaomi Token Plan)"
    Write-Host "  After:  `$10/month (OpenCode Go)"
    Write-Host "  Save:   `$40/month (80% reduction)"
    Write-Host ""
    
    Write-Host "Documentation:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  README:           https://github.com/skllfi2/mimocode-extensions"
    Write-Host "  OpenCode Go:      $OpenCodeGoUrl"
    Write-Host "  Issues:           https://github.com/skllfi2/mimocode-extensions/issues"
    Write-Host ""
}

# ============================================
# MAIN
# ============================================

function Main {
    Write-Banner
    
    Write-Host "This script will install MiMoCode Extensions v2.0.0" -ForegroundColor Cyan
    Write-Host "with OpenCode Go support, MCP servers, and token optimization." -ForegroundColor Cyan
    Write-Host ""
    
    if (Read-YesNo "Do you want to proceed with installation?") {
        Test-Dependencies
        Set-NpmConfig
        Backup-Existing
        Install-Extensions
        Install-McpServers
        Configure-OpenCodeGo
        Test-Installation
        Show-FinalInstructions
    } else {
        Write-Host ""
        Write-Host "Installation cancelled."
        exit 0
    }
}

# Run main function
Main
