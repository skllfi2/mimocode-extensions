#!/bin/bash
# MCP Server Installer for MiMoCode
# This script installs all available MCP servers

echo "╔══════════════════════════════════════╗"
echo "║   MCP Server Installer               ║"
echo "╚══════════════════════════════════════╝"
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed"
    exit 1
fi

# Fix npm allow-scripts warning
echo "Fixing npm configuration..."
npm config set allow-scripts true 2>/dev/null || true

# MCP servers to install
MCP_SERVERS=(
    "@modelcontextprotocol/server-filesystem"
    "@modelcontextprotocol/server-memory"
    "@modelcontextprotocol/server-github"
    "@modelcontextprotocol/server-sequential-thinking"
    "@modelcontextprotocol/server-postgres"
    "@modelcontextprotocol/server-puppeteer"
)

echo ""
echo "Installing MCP servers..."
echo ""

SUCCESS=0
FAILED=0

for server in "${MCP_SERVERS[@]}"; do
    echo -n "Installing $server... "
    if npm install -g "$server" 2>/dev/null; then
        echo "✓"
        ((SUCCESS++))
    else
        echo "⚠ (will use npx)"
        ((FAILED++))
    fi
done

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   Installation Complete!             ║"
echo "╚══════════════════════════════════════╝"
echo ""
echo "Installed: $SUCCESS"
echo "Fallback (npx): $FAILED"
echo ""
echo "Available MCP servers:"
echo "  1. filesystem      - File system operations"
echo "  2. memory          - Knowledge graph memory"
echo "  3. github          - GitHub API"
echo "  4. sequential-thinking - Problem solving"
echo "  5. postgres        - PostgreSQL database"
echo "  6. puppeteer       - Browser automation"
echo ""
echo "Note: Some servers may need additional configuration."
echo "Check mcp-servers.json for configuration details."
