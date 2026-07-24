# Installation Guide

## Quick Install (One Command)

### Linux/macOS

```bash
curl -fsSL https://raw.githubusercontent.com/skllfi2/mimocode-extensions/main/setup.sh | bash
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/skllfi2/mimocode-extensions/main/setup.ps1 | iex
```

## Manual Install

### 1. Clone Repository

```bash
git clone https://github.com/skllfi2/mimocode-extensions.git
cd mimocode-extensions
```

### 2. Run Installer

```bash
# Linux/macOS
bash setup.sh

# Windows
.\setup.ps1
```

## Commands

| Command | Description |
|---------|-------------|
| `install` | Fresh install (default) |
| `update` | Update from GitHub |
| `update:mcp` | Update MCP servers only |
| `status` | Show installed components |
| `uninstall` | Remove all extensions |

### Examples

```bash
# Install
bash setup.sh install

# Update from GitHub
bash setup.sh update

# Update only MCP servers
bash setup.sh update:mcp

# Check status
bash setup.sh status

# Uninstall
bash setup.sh uninstall
```

## What Gets Installed

### Components (72 total)

| Component | Count |
|-----------|-------|
| Hooks | 21 |
| Tools | 13 |
| Skills | 17 |
| Rules | 5 |
| Workflows | 4 |
| TUI Plugins | 6 |
| MCP Servers | 6 |

### MCP Servers (6)

| Server | Description |
|--------|-------------|
| filesystem | File system access |
| memory | Knowledge graph memory |
| github | GitHub API |
| sequential-thinking | Problem solving |
| postgres | PostgreSQL database |
| puppeteer | Browser automation |

### Configuration

Creates `~/.config/mimocode/mimocode.jsonc` with:

- OpenCode Go provider ($10/month)
- Model groups (lite, standard, ultra)
- MCP server configuration
- Token optimization settings
- Memory consolidation settings

## Post-Installation

### 1. Configure API Keys

Edit `~/.config/mimocode/mimocode.jsonc`:

```jsonc
{
  "provider": {
    "opencode-go": {
      "baseURL": "https://opencode.ai/zen/go/v1",
      "apiKey": "sk-go-your-api-key"
    }
  }
}
```

### 2. Restart MiMoCode

```bash
mimo
```

### 3. Verify Installation

```bash
bash setup.sh status
```

## Updating

### Update Everything

```bash
bash setup.sh update
```

### Update Only MCP Servers

```bash
bash setup.sh update:mcp
```

### Check for Updates

```bash
bash setup.sh status
```

## Troubleshooting

### "npm warn Unknown user config allow-scripts"

The installer automatically fixes this. If you see it again:

```bash
npm config set allow-scripts true
```

### "Module not found"

Use npx instead of global installation:

```jsonc
{
  "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem"]
}
```

### "Connection refused" (PostgreSQL)

Check your DATABASE_URL:

```
postgresql://username:password@host:port/database
```

### "Authentication failed" (GitHub)

1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Create new token with `repo` scope
3. Add to configuration

## Backup & Restore

### Backup

The installer automatically creates backups at:

```
~/.config/mimocode/.backup-YYYYMMDD-HHMMSS/
```

### Restore

```bash
# Find backup
ls ~/.config/mimocode/.backup-*/

# Restore
cp -r ~/.config/mimocode/.backup-YYYYMMDD-HHMMSS/.mimocode ~/.config/mimocode/
```

## Uninstall

```bash
bash setup.sh uninstall
```

This will:
1. Create a backup
2. Remove all extensions
3. Keep your configuration file
