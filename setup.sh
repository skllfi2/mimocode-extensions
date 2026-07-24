#!/bin/bash
# MiMoCode Extensions - Universal Installer & Updater
# Usage: bash setup.sh [command]
#
# Commands:
#   install     - Fresh install (default)
#   update      - Update from GitHub
#   update:mcp  - Update MCP servers only
#   status      - Show installed components
#   uninstall   - Remove all extensions

set -e

# ============================================
# CONFIGURATION
# ============================================

REPO_URL="https://github.com/skllfi2/mimocode-extensions.git"
MIMO_HOME="${MIMO_HOME:-$HOME/.config/mimocode}"
MIMO_TARGET="$MIMO_HOME/.mimocode"
BACKUP_DIR="$MIMO_HOME/.backup-$(date +%Y%m%d-%H%M%S)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================
# FUNCTIONS
# ============================================

print_header() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     MiMoCode Extensions - Universal Installer          ║${NC}"
    echo -e "${BLUE}║     Version 2.0.0                                       ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}[$1/5]${NC} $2"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

check_dependencies() {
    echo "Checking dependencies..."
    
    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        print_error "node is not installed"
        exit 1
    fi
    
    print_success "All dependencies found"
}

fix_npm_config() {
    echo "Fixing npm configuration..."
    npm config set allow-scripts true 2>/dev/null || true
    print_success "npm configured"
}

backup_existing() {
    if [ -d "$MIMO_TARGET" ]; then
        echo "Backing up existing installation..."
        mkdir -p "$BACKUP_DIR"
        cp -r "$MIMO_TARGET" "$BACKUP_DIR/" 2>/dev/null || true
        print_success "Backup created at $BACKUP_DIR"
    fi
}

clone_repo() {
    local temp_dir=$(mktemp -d)
    echo "Cloning repository..."
    
    if git clone --depth 1 "$REPO_URL" "$temp_dir" 2>/dev/null; then
        print_success "Repository cloned"
        echo "$temp_dir"
    else
        print_error "Failed to clone repository"
        exit 1
    fi
}

install_extensions() {
    local source_dir=$1
    
    echo "Installing extensions..."
    
    # Create directories
    mkdir -p "$MIMO_TARGET"/{hooks,rules,skills,workflows,tui,mcp,tools}
    
    # Copy hooks
    if [ -d "$source_dir/hooks" ]; then
        cp -r "$source_dir/hooks/"* "$MIMO_TARGET/hooks/" 2>/dev/null || true
        local hook_count=$(ls "$MIMO_TARGET/hooks/"*.ts 2>/dev/null | wc -l)
        print_success "Hooks: $hook_count installed"
    fi
    
    # Copy tools
    if [ -d "$source_dir/tools" ]; then
        cp -r "$source_dir/tools/"* "$MIMO_TARGET/tools/" 2>/dev/null || true
        local tool_count=$(ls "$MIMO_TARGET/tools/"*.ts 2>/dev/null | wc -l)
        print_success "Tools: $tool_count installed"
    fi
    
    # Copy skills
    if [ -d "$source_dir/skills" ]; then
        cp -r "$source_dir/skills/"* "$MIMO_TARGET/skills/" 2>/dev/null || true
        local skill_count=$(ls -d "$MIMO_TARGET/skills/"*/ 2>/dev/null | wc -l)
        print_success "Skills: $skill_count installed"
    fi
    
    # Copy rules
    if [ -d "$source_dir/rules" ]; then
        cp -r "$source_dir/rules/"* "$MIMO_TARGET/rules/" 2>/dev/null || true
        local rule_count=$(ls "$MIMO_TARGET/rules/"*.md 2>/dev/null | wc -l)
        print_success "Rules: $rule_count installed"
    fi
    
    # Copy workflows
    if [ -d "$source_dir/workflows" ]; then
        cp -r "$source_dir/workflows/"* "$MIMO_TARGET/workflows/" 2>/dev/null || true
        local workflow_count=$(ls "$MIMO_TARGET/workflows/"*.js 2>/dev/null | wc -l)
        print_success "Workflows: $workflow_count installed"
    fi
    
    # Copy TUI plugins
    if [ -d "$source_dir/tui" ]; then
        cp -r "$source_dir/tui/"* "$MIMO_TARGET/tui/" 2>/dev/null || true
        local tui_count=$(ls "$MIMO_TARGET/tui/"*.tsx 2>/dev/null | wc -l)
        print_success "TUI Plugins: $tui_count installed"
    fi
    
    # Copy MCP configs
    if [ -d "$source_dir/mcp" ]; then
        cp -r "$source_dir/mcp/"* "$MIMO_TARGET/mcp/" 2>/dev/null || true
        print_success "MCP configs installed"
    fi
    
    # Copy plugin.ts
    if [ -f "$source_dir/plugin.ts" ]; then
        cp "$source_dir/plugin.ts" "$MIMO_TARGET/" 2>/dev/null || true
        print_success "Plugin entry installed"
    fi
    
    # Copy package.json
    if [ -f "$source_dir/package.json" ]; then
        cp "$source_dir/package.json" "$MIMO_TARGET/" 2>/dev/null || true
        print_success "Package.json installed"
    fi
}

install_mcp_servers() {
    echo ""
    echo "Installing MCP servers..."
    
    MCP_SERVERS=(
        "@modelcontextprotocol/server-filesystem"
        "@modelcontextprotocol/server-memory"
        "@modelcontextprotocol/server-github"
        "@modelcontextprotocol/server-sequential-thinking"
        "@modelcontextprotocol/server-postgres"
        "@modelcontextprotocol/server-puppeteer"
    )
    
    local success=0
    local failed=0
    
    for server in "${MCP_SERVERS[@]}"; do
        echo -n "  Installing $(basename $server)... "
        if npm install -g "$server" 2>/dev/null; then
            echo -e "${GREEN}✓${NC}"
            ((success++))
        else
            echo -e "${YELLOW}⚠ (will use npx)${NC}"
            ((failed++))
        fi
    done
    
    echo ""
    print_success "MCP servers: $success installed, $failed will use npx"
}

create_config() {
    local config_file="$MIMO_HOME/mimocode.jsonc"
    
    if [ ! -f "$config_file" ]; then
        echo "Creating default configuration..."
        cat > "$config_file" << 'EOF'
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
EOF
        print_success "Configuration created at $config_file"
        print_warning "Edit $config_file to add your API keys"
    else
        print_warning "Configuration already exists, skipping"
    fi
}

show_status() {
    echo ""
    echo -e "${BLUE}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║     MiMoCode Extensions Status                         ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    if [ ! -d "$MIMO_TARGET" ]; then
        print_error "Extensions not installed"
        return
    fi
    
    # Count components
    local hooks=$(ls "$MIMO_TARGET/hooks/"*.ts 2>/dev/null | wc -l)
    local tools=$(ls "$MIMO_TARGET/tools/"*.ts 2>/dev/null | wc -l)
    local skills=$(ls -d "$MIMO_TARGET/skills/"*/ 2>/dev/null | wc -l)
    local rules=$(ls "$MIMO_TARGET/rules/"*.md 2>/dev/null | wc -l)
    local workflows=$(ls "$MIMO_TARGET/workflows/"*.js 2>/dev/null | wc -l)
    local tui=$(ls "$MIMO_TARGET/tui/"*.tsx 2>/dev/null | wc -l)
    
    echo "Installed Components:"
    echo "  Hooks:       $hooks"
    echo "  Tools:       $tools"
    echo "  Skills:      $skills"
    echo "  Rules:       $rules"
    echo "  Workflows:   $workflows"
    echo "  TUI Plugins: $tui"
    echo "  ─────────────────"
    echo "  Total:       $((hooks + tools + skills + rules + workflows + tui))"
    echo ""
    
    # Check MCP servers
    echo "MCP Servers:"
    local mcp_count=0
    for server in filesystem memory github sequential-thinking postgres puppeteer; do
        if npm list -g "@modelcontextprotocol/server-$server" 2>/dev/null | grep -q "@modelcontextprotocol"; then
            echo "  $server: ✓ installed"
            ((mcp_count++))
        else
            echo "  $server: ⚠ npx fallback"
        fi
    done
    echo "  ─────────────────"
    echo "  Total: $mcp_count installed, $((6 - mcp_count)) npx fallback"
    echo ""
    
    # Check config
    if [ -f "$MIMO_HOME/mimocode.jsonc" ]; then
        echo "Configuration: ✓ exists"
    else
        echo "Configuration: ✗ missing"
    fi
}

uninstall() {
    echo ""
    echo -e "${YELLOW}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║     Uninstalling MiMoCode Extensions                   ║${NC}"
    echo -e "${YELLOW}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    read -p "Are you sure you want to uninstall? (y/N) " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Uninstall cancelled"
        return
    fi
    
    if [ -d "$MIMO_TARGET" ]; then
        backup_existing
        rm -rf "$MIMO_TARGET"
        print_success "Extensions removed"
    else
        print_warning "Extensions not found"
    fi
}

cleanup() {
    local temp_dir=$1
    if [ -d "$temp_dir" ]; then
        rm -rf "$temp_dir"
    fi
}

# ============================================
# MAIN COMMANDS
# ============================================

cmd_install() {
    print_header
    echo "Installing MiMoCode Extensions..."
    echo ""
    
    check_dependencies
    fix_npm_config
    
    print_step 1 "Backing up existing installation"
    backup_existing
    
    print_step 2 "Cloning repository"
    local temp_dir=$(clone_repo)
    
    print_step 3 "Installing extensions"
    install_extensions "$temp_dir"
    
    print_step 4 "Installing MCP servers"
    install_mcp_servers
    
    print_step 5 "Creating configuration"
    create_config
    
    cleanup "$temp_dir"
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     Installation Complete!                             ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Edit $MIMO_HOME/mimocode.jsonc with your API keys"
    echo "  2. Restart MiMoCode"
    echo "  3. Enjoy 80% cost savings!"
    echo ""
}

cmd_update() {
    print_header
    echo "Updating MiMoCode Extensions..."
    echo ""
    
    check_dependencies
    fix_npm_config
    
    print_step 1 "Backing up current installation"
    backup_existing
    
    print_step 2 "Cloning latest version"
    local temp_dir=$(clone_repo)
    
    print_step 3 "Updating extensions"
    install_extensions "$temp_dir"
    
    print_step 4 "Updating MCP servers"
    install_mcp_servers
    
    cleanup "$temp_dir"
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     Update Complete!                                   ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Restart MiMoCode to use the updated extensions."
    echo ""
}

cmd_update_mcp() {
    print_header
    echo "Updating MCP servers..."
    echo ""
    
    check_dependencies
    fix_npm_config
    
    install_mcp_servers
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║     MCP Update Complete!                               ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

cmd_status() {
    print_header
    show_status
}

cmd_uninstall() {
    print_header
    uninstall
}

# ============================================
# ENTRY POINT
# ============================================

COMMAND="${1:-install}"

case $COMMAND in
    install)
        cmd_install
        ;;
    update)
        cmd_update
        ;;
    update:mcp)
        cmd_update_mcp
        ;;
    status)
        cmd_status
        ;;
    uninstall)
        cmd_uninstall
        ;;
    *)
        echo "Usage: bash setup.sh [command]"
        echo ""
        echo "Commands:"
        echo "  install     - Fresh install (default)"
        echo "  update      - Update from GitHub"
        echo "  update:mcp  - Update MCP servers only"
        echo "  status      - Show installed components"
        echo "  uninstall   - Remove all extensions"
        exit 1
        ;;
esac
