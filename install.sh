#!/bin/bash
# MiMoCode Extensions Installer (Updated v2.0)
# Usage: bash install.sh [source_dir] [target_dir]
#
# Examples:
#   bash install.sh                          # Install from current dir to ~/.config/mimocode
#   bash install.sh ./mimocode-extensions     # Install from specific source
#   bash install.sh . /custom/path            # Custom target

set -e

SOURCE_DIR="${1:-.}"
TARGET_DIR="${2:-$HOME/.config/mimocode}"

MIMO_TARGET="$TARGET_DIR/.mimocode"

echo "╔══════════════════════════════════════╗"
echo "║   MiMoCode Extensions Installer     ║"
echo "║   v2.0 - OpenCode Go + MCP Support  ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "Source: $SOURCE_DIR"
echo "Target: $MIMO_TARGET"
echo ""

# Verify source exists
if [ ! -d "$SOURCE_DIR/hooks" ] && [ ! -d "$SOURCE_DIR/skills" ]; then
    echo "ERROR: Source directory doesn't contain MiMoCode extensions."
    echo "Expected to find hooks/, skills/, or rules/ directories."
    exit 1
fi

# Create target directories
echo "Creating directories..."
mkdir -p "$MIMO_TARGET"/{hooks,rules,skills,workflows,tui,mcp}

# Copy hooks
if [ -d "$SOURCE_DIR/hooks" ]; then
    echo "Installing hooks..."
    cp -v "$SOURCE_DIR/hooks/"*.ts "$MIMO_TARGET/hooks/" 2>/dev/null || true
fi

# Copy rules
if [ -d "$SOURCE_DIR/rules" ]; then
    echo "Installing rules..."
    cp -v "$SOURCE_DIR/rules/"*.md "$MIMO_TARGET/rules/" 2>/dev/null || true
fi

# Copy skills
if [ -d "$SOURCE_DIR/skills" ]; then
    echo "Installing skills..."
    for skill_dir in "$SOURCE_DIR/skills"/*/; do
        if [ -d "$skill_dir" ]; then
            skill_name=$(basename "$skill_dir")
            mkdir -p "$MIMO_TARGET/skills/$skill_name"
            cp -v "$skill_dir"* "$MIMO_TARGET/skills/$skill_name/" 2>/dev/null || true
        fi
    done
fi

# Copy workflows
if [ -d "$SOURCE_DIR/workflows" ]; then
    echo "Installing workflows..."
    cp -v "$SOURCE_DIR/workflows/"*.js "$MIMO_TARGET/workflows/" 2>/dev/null || true
fi

# Copy TUI plugins
if [ -d "$SOURCE_DIR/tui" ]; then
    echo "Installing TUI plugins..."
    cp -v "$SOURCE_DIR/tui/"*.tsx "$MIMO_TARGET/tui/" 2>/dev/null || true
fi

# Copy MCP configs
if [ -d "$SOURCE_DIR/mcp" ]; then
    echo "Installing MCP configurations..."
    cp -v "$SOURCE_DIR/mcp/"*.json "$MIMO_TARGET/mcp/" 2>/dev/null || true
    cp -v "$SOURCE_DIR/mcp/"*.sh "$MIMO_TARGET/mcp/" 2>/dev/null || true
fi

# Copy package.json if exists
if [ -f "$SOURCE_DIR/package.json" ]; then
    echo "Copying package.json..."
    cp -v "$SOURCE_DIR/package.json" "$MIMO_TARGET/" 2>/dev/null || true
fi

# Fix npm allow-scripts warning
echo ""
echo "Fixing npm configuration..."
npm config set allow-scripts true 2>/dev/null || true

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   Installation Complete!            ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "Installed to: $MIMO_TARGET"
echo ""
echo "Next steps:"
echo "  1. Install MCP servers: bash $MIMO_TARGET/mcp/install-mcp.sh"
echo "  2. Configure OpenCode Go in ~/.config/mimocode/mimocode.jsonc"
echo "  3. Restart MiMoCode"
echo ""
echo "Components installed:"
echo "  - Hooks: $(ls "$MIMO_TARGET/hooks/"*.ts 2>/dev/null | wc -l)"
echo "  - Skills: $(ls -d "$MIMO_TARGET/skills/"*/ 2>/dev/null | wc -l)"
echo "  - Rules: $(ls "$MIMO_TARGET/rules/"*.md 2>/dev/null | wc -l)"
echo "  - Workflows: $(ls "$MIMO_TARGET/workflows/"*.js 2>/dev/null | wc -l)"
echo ""
echo "Hot reload:"
echo "  - Hooks & tools: next MiMoCode turn"
echo "  - Skills: next MiMoCode turn"
echo "  - Workflows: on invoke"
echo "  - TUI: restart MiMoCode"
