# MCP Servers Guide

## Overview

MiMoCode Extensions v2.0 includes 6 MCP servers for enhanced functionality.

## Available Servers

### 1. Filesystem (`@modelcontextprotocol/server-filesystem`)

**Purpose**: File system operations with configurable access controls

**Features**:
- Read/write files
- Create/delete directories
- List files and directories
- Configurable access paths

**Configuration**:
```jsonc
{
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}
```

**Use Cases**:
- Reading project files
- Writing configuration files
- Managing file structure

---

### 2. Memory (`@modelcontextprotocol/server-memory`)

**Purpose**: Knowledge graph-based persistent memory system

**Features**:
- Store and retrieve knowledge
- Build knowledge graphs
- Query relationships between entities
- Persistent across sessions

**Configuration**:
```jsonc
{
  "mcp": {
    "memory": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

**Use Cases**:
- Project knowledge base
- Entity relationship mapping
- Long-term memory storage

---

### 3. GitHub (`@modelcontextprotocol/server-github`)

**Purpose**: GitHub API integration

**Features**:
- Repository management
- Issue tracking
- Pull request operations
- Code search

**Configuration**:
```jsonc
{
  "mcp": {
    "github": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token-here"
      }
    }
  }
}
```

**Setup**:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Create a new token with `repo` scope
3. Add token to configuration

**Use Cases**:
- Creating issues
- Managing pull requests
- Searching code
- Repository operations

---

### 4. Sequential Thinking (`@modelcontextprotocol/server-sequential-thinking`)

**Purpose**: Dynamic and reflective problem-solving through thought sequences

**Features**:
- Step-by-step problem analysis
- Thought chain tracking
- Reflection on reasoning
- Complex problem decomposition

**Configuration**:
```jsonc
{
  "mcp": {
    "sequential-thinking": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-sequential-thinking"]
    }
  }
}
```

**Use Cases**:
- Complex debugging
- Architecture decisions
- Algorithm design
- Problem decomposition

---

### 5. PostgreSQL (`@modelcontextprotocol/server-postgres`)

**Purpose**: PostgreSQL database access

**Features**:
- Execute SQL queries
- Database schema inspection
- Query optimization
- Data manipulation

**Configuration**:
```jsonc
{
  "mcp": {
    "postgres": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://user:password@localhost:5432/dbname"
      }
    }
  }
}
```

**Use Cases**:
- Database queries
- Schema analysis
- Data migration
- Query optimization

---

### 6. Puppeteer (`@modelcontextprotocol/server-puppeteer`)

**Purpose**: Browser automation and web scraping

**Features**:
- Navigate web pages
- Take screenshots
- Fill forms
- Execute JavaScript
- Web scraping

**Configuration**:
```jsonc
{
  "mcp": {
    "puppeteer": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

**Use Cases**:
- Web scraping
- Browser testing
- Screenshot capture
- Form automation

---

## Installation

### Quick Install

```bash
bash ~/.config/mimocode/.mimocode/mcp/install-mcp.sh
```

### Manual Install

```bash
# Fix npm warning
npm config set allow-scripts true

# Install all servers
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-memory
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-sequential-thinking
npm install -g @modelcontextprotocol/server-postgres
npm install -g @modelcontextprotocol/server-puppeteer
```

### Fallback: Use npx

If global installation fails, use npx in your config:

```jsonc
{
  "mcp": {
    "filesystem": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem"]
    }
  }
}
```

---

## Complete Configuration

```jsonc
{
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
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "your-token"
      }
    },
    "sequential-thinking": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-sequential-thinking"]
    },
    "postgres": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "DATABASE_URL": "postgresql://user:pass@localhost/db"
      }
    },
    "puppeteer": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

---

## Troubleshooting

### "npm warn Unknown user config allow-scripts"

**Fix**:
```bash
npm config set allow-scripts true
```

### "Module not found"

**Fix**: Use npx instead of global installation:
```jsonc
{
  "command": ["npx", "-y", "@modelcontextprotocol/server-filesystem"]
}
```

### "Connection refused" (PostgreSQL)

**Fix**: Check your DATABASE_URL:
```
postgresql://username:password@host:port/database
```

### "Authentication failed" (GitHub)

**Fix**: Check your GitHub token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Create new token with `repo` scope
3. Add to configuration

---

## Performance Tips

1. **Use npx for reliability**: Global installation can have issues
2. **Configure only needed servers**: Don't enable all 6 if you don't need them
3. **Cache MCP servers**: npx caches packages after first run
4. **Monitor usage**: Check `mimo stats` for token consumption
