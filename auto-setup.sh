#!/bin/bash
# MiMoCode Extensions - Fully Automated Installer
# Usage: bash auto-setup.sh
#
# This script will:
# 1. Check and install dependencies
# 2. Clone and install extensions
# 3. Install MCP servers
# 4. Configure OpenCode Go (optional)
# 5. Set up token optimization
# 6. Verify installation

set -e

# ============================================
# CONFIGURATION
# ============================================

REPO_URL="https://github.com/skllfi2/mimocode-extensions.git"
MIMO_HOME="${MIMO_HOME:-$HOME/.config/mimocode}"
MIMO_TARGET="$MIMO_HOME/.mimocode"
OPENCODE_GO_URL="https://opencode.ai"
OPENCODE_GO_PRICING="https://opencode.ai/ru/go/"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# ============================================
# FUNCTIONS
# ============================================

print_banner() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                              ║${NC}"
    echo -e "${CYAN}║     MiMoCode Extensions - Fully Automated Installer          ║${NC}"
    echo -e "${CYAN}║     Version 2.0.0                                            ║${NC}"
    echo -e "${CYAN}║                                                              ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_step() {
    echo ""
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}[$1/7]${NC} $2"
    echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    echo -e "${GREEN}  ✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}  ⚠${NC} $1"
}

print_error() {
    echo -e "${RED}  ✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}  ℹ${NC} $1"
}

ask_yes_no() {
    local prompt="$1"
    local default="${2:-y}"
    
    if [ "$default" = "y" ]; then
        prompt="$prompt [Y/n]: "
    else
        prompt="$prompt [y/N]: "
    fi
    
    read -p "$prompt" -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    elif [[ $REPLY =~ ^[Nn]$ ]]; then
        return 1
    elif [ "$default" = "y" ]; then
        return 0
    else
        return 1
    fi
}

# ============================================
# STEP 1: Check Dependencies
# ============================================

check_dependencies() {
    print_step 1 "Checking dependencies"
    
    local missing=0
    
    # Check git
    if command -v git &> /dev/null; then
        print_success "git $(git --version | cut -d' ' -f3)"
    else
        print_error "git is not installed"
        print_info "Install: sudo apt install git / brew install git"
        missing=1
    fi
    
    # Check node
    if command -v node &> /dev/null; then
        print_success "node $(node --version)"
    else
        print_error "node is not installed"
        print_info "Install: https://nodejs.org/"
        missing=1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        print_success "npm $(npm --version)"
    else
        print_error "npm is not installed"
        print_info "Install: comes with node"
        missing=1
    fi
    
    # Check curl
    if command -v curl &> /dev/null; then
        print_success "curl available"
    else
        print_warning "curl not found (optional)"
    fi
    
    if [ $missing -eq 1 ]; then
        echo ""
        print_error "Missing required dependencies. Please install them first."
        exit 1
    fi
    
    print_success "All dependencies satisfied"
}

# ============================================
# STEP 2: Fix npm Configuration
# ============================================

fix_npm_config() {
    print_step 2 "Fixing npm configuration"
    
    # Fix allow-scripts warning
    npm config set allow-scripts true 2>/dev/null || true
    print_success "npm allow-scripts enabled"
    
    # Set package manager
    npm config set package-manager npm 2>/dev/null || true
    print_success "npm configured"
}

# ============================================
# STEP 3: Backup Existing Installation
# ============================================

backup_existing() {
    print_step 3 "Backing up existing installation"
    
    if [ -d "$MIMO_TARGET" ]; then
        local backup_dir="$MIMO_HOME/.backup-$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$backup_dir"
        cp -r "$MIMO_TARGET" "$backup_dir/" 2>/dev/null || true
        print_success "Backup created at $backup_dir"
    else
        print_info "No existing installation to backup"
    fi
}

# ============================================
# STEP 4: Clone and Install Extensions
# ============================================

install_extensions() {
    print_step 4 "Installing extensions"
    
    local temp_dir=$(mktemp -d)
    
    # Clone repository
    print_info "Cloning repository..."
    if git clone --depth 1 "$REPO_URL" "$temp_dir" 2>/dev/null; then
        print_success "Repository cloned"
    else
        print_error "Failed to clone repository"
        exit 1
    fi
    
    # Create directories
    mkdir -p "$MIMO_TARGET"/{hooks,rules,skills,workflows,tui,mcp,tools}
    
    # Copy hooks
    if [ -d "$temp_dir/hooks" ]; then
        cp -r "$temp_dir/hooks/"* "$MIMO_TARGET/hooks/" 2>/dev/null || true
        local count=$(ls "$MIMO_TARGET/hooks/"*.ts 2>/dev/null | wc -l)
        print_success "Hooks: $count installed"
    fi
    
    # Copy tools
    if [ -d "$temp_dir/tools" ]; then
        cp -r "$temp_dir/tools/"* "$MIMO_TARGET/tools/" 2>/dev/null || true
        local count=$(ls "$MIMO_TARGET/tools/"*.ts 2>/dev/null | wc -l)
        print_success "Tools: $count installed"
    fi
    
    # Copy skills
    if [ -d "$temp_dir/skills" ]; then
        cp -r "$temp_dir/skills/"* "$MIMO_TARGET/skills/" 2>/dev/null || true
        local count=$(ls -d "$MIMO_TARGET/skills/"*/ 2>/dev/null | wc -l)
        print_success "Skills: $count installed"
    fi
    
    # Copy rules
    if [ -d "$temp_dir/rules" ]; then
        cp -r "$temp_dir/rules/"* "$MIMO_TARGET/rules/" 2>/dev/null || true
        local count=$(ls "$MIMO_TARGET/rules/"*.md 2>/dev/null | wc -l)
        print_success "Rules: $count installed"
    fi
    
    # Copy workflows
    if [ -d "$temp_dir/workflows" ]; then
        cp -r "$temp_dir/workflows/"* "$MIMO_TARGET/workflows/" 2>/dev/null || true
        local count=$(ls "$MIMO_TARGET/workflows/"*.js 2>/dev/null | wc -l)
        print_success "Workflows: $count installed"
    fi
    
    # Copy TUI plugins
    if [ -d "$temp_dir/tui" ]; then
        cp -r "$temp_dir/tui/"* "$MIMO_TARGET/tui/" 2>/dev/null || true
        local count=$(ls "$MIMO_TARGET/tui/"*.tsx 2>/dev/null | wc -l)
        print_success "TUI Plugins: $count installed"
    fi
    
    # Copy MCP configs
    if [ -d "$temp_dir/mcp" ]; then
        cp -r "$temp_dir/mcp/"* "$MIMO_TARGET/mcp/" 2>/dev/null || true
        print_success "MCP configs installed"
    fi
    
    # Copy plugin.ts
    if [ -f "$temp_dir/plugin.ts" ]; then
        cp "$temp_dir/plugin.ts" "$MIMO_TARGET/" 2>/dev/null || true
        print_success "Plugin entry installed"
    fi
    
    # Copy package.json
    if [ -f "$temp_dir/package.json" ]; then
        cp "$temp_dir/package.json" "$MIMO_TARGET/" 2>/dev/null || true
        print_success "Package.json installed"
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
}

# ============================================
# STEP 5: Install MCP Servers
# ============================================

install_mcp_servers() {
    print_step 5 "Installing MCP servers"
    
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
        local name=$(basename $server)
        echo -n "  Installing $name... "
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

# ============================================
# STEP 6: Configure OpenCode Go (Optional)
# ============================================

configure_opencode_go() {
    print_step 6 "Configure OpenCode Go (Optional)"
    
    echo ""
    echo -e "${CYAN}OpenCode Go provides access to multiple AI models for $10/month.${NC}"
    echo -e "${CYAN}This includes MiMo V2.5, DeepSeek V4 Flash, GLM-5.2, and more.${NC}"
    echo ""
    echo -e "${BLUE}Pricing:${NC}"
    echo "  - $10/month for all models"
    echo "  - $60 usage limit per month"
    echo "  - Save up to 80% vs other providers"
    echo ""
    
    if ask_yes_no "Do you want to configure OpenCode Go?"; then
        echo ""
        echo -e "${CYAN}To get an API key:${NC}"
        echo "  1. Visit $OPENCODE_GO_URL"
        echo "  2. Sign up for an account"
        echo "  3. Subscribe to OpenCode Go ($10/month)"
        echo "  4. Go to Dashboard → API Keys → Create"
        echo ""
        
        read -p "Enter your OpenCode Go API key (or press Enter to skip): " api_key
        
        if [ -n "$api_key" ]; then
            # Create config with API key
            create_config_with_key "$api_key"
            print_success "OpenCode Go configured"
        else
            print_info "Skipping OpenCode Go configuration"
            create_config_without_key
        fi
    else
        print_info "Skipping OpenCode Go configuration"
        create_config_without_key
    fi
}

# ============================================
# STEP 7: Create Configuration
# ============================================

create_config_with_key() {
    local api_key=$1
    local config_file="$MIMO_HOME/mimocode.jsonc"
    
    cat > "$config_file" << EOF
{
  "\$schema": "https://mimo.xiaomi.com/mimocode/config.json",
  
  "model": "opencode-go/mimo-v2.5",
  
  "provider": {
    "opencode-go": {
      "baseURL": "https://opencode.ai/zen/go/v1",
      "apiKey": "$api_key"
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
    
    print_success "Configuration created with API key"
}

create_config_without_key() {
    local config_file="$MIMO_HOME/mimocode.jsonc"
    
    if [ ! -f "$config_file" ]; then
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
        print_success "Configuration created (edit to add API key)"
    else
        print_warning "Configuration already exists, skipping"
    fi
}

# ============================================
# STEP 8: Verify Installation
# ============================================

verify_installation() {
    print_step 7 "Verifying installation"
    
    local hooks=$(ls "$MIMO_TARGET/hooks/"*.ts 2>/dev/null | wc -l)
    local tools=$(ls "$MIMO_TARGET/tools/"*.ts 2>/dev/null | wc -l)
    local skills=$(ls -d "$MIMO_TARGET/skills/"*/ 2>/dev/null | wc -l)
    local rules=$(ls "$MIMO_TARGET/rules/"*.md 2>/dev/null | wc -l)
    local workflows=$(ls "$MIMO_TARGET/workflows/"*.js 2>/dev/null | wc -l)
    local tui=$(ls "$MIMO_TARGET/tui/"*.tsx 2>/dev/null | wc -l)
    local total=$((hooks + tools + skills + rules + workflows + tui))
    
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    Installation Summary                     ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${GREEN}Components Installed:${NC}"
    echo "  Hooks:       $hooks"
    echo "  Tools:       $tools"
    echo "  Skills:      $skills"
    echo "  Rules:       $rules"
    echo "  Workflows:   $workflows"
    echo "  TUI Plugins: $tui"
    echo "  ─────────────────"
    echo -e "  Total:       ${GREEN}$total${NC}"
    echo ""
    
    # Check MCP servers
    echo -e "${GREEN}MCP Servers:${NC}"
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
    echo -e "  Total: ${GREEN}$mcp_count${NC} installed, $((6 - mcp_count)) npx fallback
    echo ""
    
    # Check config
    if [ -f "$MIMO_HOME/mimocode.jsonc" ]; then
        echo -e "${GREEN}Configuration:${NC} ✓ exists"
    else
        echo -e "${RED}Configuration:${NC} ✗ missing"
    fi
    echo ""
}

# ============================================
# PRINT FINAL INSTRUCTIONS
# ============================================

print_final_instructions() {
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                              ║${NC}"
    echo -e "${CYAN}║                    Installation Complete!                    ║${NC}"
    echo -e "${CYAN}║                                                              ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${GREEN}Next Steps:${NC}"
    echo ""
    echo "  1. ${YELLOW}Edit configuration:${NC}"
    echo "     $MIMO_HOME/mimocode.jsonc"
    echo ""
    echo "  2. ${YELLOW}Add your API key:${NC}"
    echo "     Replace YOUR_API_KEY_HERE with your OpenCode Go API key"
    echo ""
    echo "  3. ${YELLOW}Restart MiMoCode:${NC}"
    echo "     mimo"
    echo ""
    
    echo -e "${GREEN}Useful Commands:${NC}"
    echo ""
    echo "  Check status:     bash setup.sh status"
    echo "  Update:           bash setup.sh update"
    echo "  Update MCP:       bash setup.sh update:mcp"
    echo "  Uninstall:        bash setup.sh uninstall"
    echo ""
    
    echo -e "${GREEN}Cost Savings:${NC}"
    echo ""
    echo "  Before: \$50/month (Xiaomi Token Plan)"
    echo "  After:  \$10/month (OpenCode Go)"
    echo "  Save:   \$40/month (80% reduction)"
    echo ""
    
    echo -e "${CYAN}Documentation:${NC}"
    echo ""
    echo "  README:           https://github.com/skllfi2/mimocode-extensions"
    echo "  OpenCode Go:      $OPENCODE_GO_URL"
    echo "  Issues:           https://github.com/skllfi2/mimocode-extensions/issues"
    echo ""
}

# ============================================
# MAIN
# ============================================

main() {
    print_banner
    
    echo -e "${CYAN}This script will install MiMoCode Extensions v2.0.0${NC}"
    echo -e "${CYAN}with OpenCode Go support, MCP servers, and token optimization.${NC}"
    echo ""
    
    if ask_yes_no "Do you want to proceed with installation?"; then
        check_dependencies
        fix_npm_config
        backup_existing
        install_extensions
        install_mcp_servers
        configure_opencode_go
        verify_installation
        print_final_instructions
    else
        echo ""
        echo "Installation cancelled."
        exit 0
    fi
}

# Run main function
main
