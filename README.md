# MiMoCode Extensions (Updated v2.0)

A curated collection of hooks, tools, skills, workflows, rules, and TUI plugins for [MiMoCode](https://github.com/anthropics/claude-code) — inspired by [oh-my-openagent](https://github.com/code-yeongyu/oh-my-openagent).

## What's New in v2.0

- ✅ **MimoLauncher** — WinUI 3 unified control center for projects and extensions
- ✅ **OpenCode Go Support** — $10/month for all models
- ✅ **DeepSeek V4 Flash** — cheapest model for simple tasks
- ✅ **Token Optimization** — 40-60% savings
- ✅ **6 MCP Servers** — filesystem, memory, github, sequential-thinking, postgres, puppeteer
- ✅ **Fixed npm Issues** — no more "allow-scripts" warnings

## MimoLauncher (WinUI 3)

**Unified control center for MiMoCode projects and extensions.**

### Features
- **Projects Tab**: Manage projects, launch MiMoCode, open terminals
- **Terminal Tab**: Integrated PowerShell terminal
- **Extensions Tab**: Install, update, manage extensions

### Quick Start

```powershell
cd launcher/MimoLauncher
dotnet run
```

### More Info
See [launcher/README.md](launcher/README.md) for detailed documentation.

## Quick Install (One Command)

### Linux/macOS
```bash
curl -fsSL https://raw.githubusercontent.com/skllfi2/mimocode-extensions/main/setup.sh | bash
```

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/skllfi2/mimocode-extensions/main/setup.ps1 | iex
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
```

## What's Inside

### Hooks (33 - Optimized)
| Hook | Description |
|------|-------------|
| `comment-checker` | Blocks AI slop words (clearly, simply, robust, leverage) |
| `rules-injector` | Auto-injects project rules from `.mimocode/rules/*.md` |
| `write-existing-file-guard` | Prevents writing to files not read in current session |
| `intent-gate` | Classifies user intent by keywords (ultrawork, research, fix, refactor) |
| `todo-enforcer` | Reminds about incomplete tasks after 5 minutes idle |
| `dangerous-command-guard` | Blocks destructive bash commands |
| `goal` | Goal tracking and persistence |
| `think-mode` | Extended thinking for complex tasks |
| `start-work` | Work session management |
| `session-tracker` | Logs session outcomes for analytics |
| `auto-test` | Suggests syntax verification after file edits |
| `error-explainer` | Explains common error codes with fix suggestions |
| `edit-error-recovery` | Guides recovery from edit failures |
| `json-error-recovery` | Handles JSON parse errors |
| `output-truncator` | Limits tool output to 40KB |
| `context-preservation` | Preserves TODO/FIXME markers |
| `tool-pair-validator` | Warns if writing without reading first |
| `directory-context` | Auto-injects AGENTS.md/README.md |
| `empty-response-detector` | Detects empty responses |
| `session-notification` | Session status notifications |
| `non-interactive-env` | Non-interactive environment support |
| `error-validator` | Consolidated error pattern + handling validation |
| `winui3-validator` | Consolidated WinUI3 validation with caching |
| `config-validator` | Consolidated config + runtime state validation |
| `resource-tracker` | Tracks resource lifecycle and alerts on leaks |
| `test-validator` | Validates testing patterns |
| `memory-tracker` | Tracks project state and documentation |
| `git-validator` | Validates git operations and prevents mistakes |
| `component-integration-validator` | Validates DI chains and event handlers |
| `performance-validator` | Validates performance patterns |
| `thread-safety-validator` | Validates thread safety patterns |
| `platform-issues-validator` | Validates platform-specific issues |
| `ux-issues-validator` | Validates UX patterns |

### Tools (13)
| Tool | Description |
|------|-------------|
| `weather` | Current weather via Open-Meteo API |
| `hashline` | Read files with LINE#ID content hashes |
| `json-query` | Query JSON data using dot-notation |
| `color-convert` | Convert colors between HEX, RGB, HSL |
| `uuid-gen` | Generate UUIDs, short IDs, hex tokens |
| `portable-pack` | Pack/unpack extensions for transfer |
| `git-smart` | Smart git: stale branches, changelog |
| `file-hash` | Compute file hashes (MD5, SHA1, SHA256) |
| `time-utils` | Convert timestamps, timezone info |
| `text-transform` | Case conversion, slug generation |
| `env-check` | Check tool availability, PATH |
| `look-at` | Analyze media files (PDFs, images) |
| `session-manager` | Session management utilities |

### Skills (18)
| Skill | Trigger |
|-------|---------|
| `project-context` | Auto-loaded project context |
| `security-audit` | OWASP Top 10 security review |
| `git-master` | Complex git operations |
| `frontend-design` | UI/UX, accessibility |
| `database` | Schema design, migrations |
| `mcp-setup` | MCP server configuration |
| `ultrawork` | Full autonomous work mode |
| `code-review` | Structured code review |
| `api-design` | REST/GraphQL/gRPC design |
| `init-deep` | Generate hierarchical AGENTS.md |
| `tmux-mastery` | Tmux session management |
| `debugging` | Systematic debugging |
| `prompt-engineering` | Prompt patterns |
| `docker` | Docker best practices |
| `playwright` | Browser automation |
| `smart-rebase` | Git rebase operations |
| `work-with-pr` | Pull request workflow |
| `error-audit` | Audit code for common error patterns |

### Rules (9)
| Rule | Content |
|------|---------|
| `code-style` | const/let, early returns, naming |
| `commit-style` | Conventional commits |
| `security` | OWASP, secrets, input sanitization |
| `performance` | Streaming, Map/Set, lazy loading |
| `anti-patterns` | Common mistakes |
| `error-prevention` | Error patterns and prevention rules |
| `runtime-validation` | Runtime state validation rules |
| `comprehensive-validation` | All validation categories |
| `winui3-patterns` | WinUI3 specific patterns |

### Workflows (4)
| Workflow | Description |
|----------|-------------|
| `pr-review` | Parallel PR review |
| `dep-audit` | Dependency audit |
| `full-audit` | Comprehensive audit |
| `quick-refactor` | Quick refactoring |

### TUI Plugins (10)
| Plugin | Description |
|--------|-------------|
| `plugin.ts` | Main plugin entry |
| `command-palette` | Command palette |
| `extensions-panel` | Extensions view |
| `quick-actions` | Quick action buttons |
| `session-dashboard` | Session info |
| `status-bar` | Live status |
| `status-panel` | Status details |
| `sidebar-enhanced` | Enhanced sidebar with project/model/MCP info |
| `sidebar-menu` | Quick actions menu in sidebar |
| `token-stats` | Token usage statistics |
| `mcp-panel` | MCP server management panel |

### MCP Servers (6)
| Server | Description | Status |
|--------|-------------|--------|
| `filesystem` | File system access | ✅ Available |
| `memory` | Knowledge graph memory | ✅ Available |
| `github` | GitHub API | ✅ Available |
| `sequential-thinking` | Problem solving | ✅ Available |
| `postgres` | PostgreSQL database | ✅ Available |
| `puppeteer` | Browser automation | ✅ Available |

## MCP Server Setup

### Install All Servers

```bash
bash ~/.config/mimocode/.mimocode/mcp/install-mcp.sh
```

### Or Install Manually

```bash
# Fix npm warning first
npm config set allow-scripts true

# Install servers
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-memory
npm install -g @modelcontextprotocol/server-github
npm install -g @modelcontextprotocol/server-sequential-thinking
npm install -g @modelcontextprotocol/server-postgres
npm install -g @modelcontextprotocol/server-puppeteer
```

### Configure in MiMoCode

Add to `~/.config/mimocode/mimocode.jsonc`:

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

## OpenCode Go Setup

### 1. Register
Visit https://opencode.ai and subscribe to OpenCode Go ($10/month)

### 2. Get API Key
Dashboard → API Keys → Create

### 3. Configure
Add to `~/.config/mimocode/mimocode.jsonc`:

```jsonc
{
  "model": "opencode-go/mimo-v2.5",
  "provider": {
    "opencode-go": {
      "baseURL": "https://opencode.ai/zen/go/v1",
      "apiKey": "sk-go-your-key"
    }
  },
  "model_groups": {
    "lite": "opencode-go/deepseek-v4-flash",
    "standard": "opencode-go/mimo-v2.5",
    "ultra": "opencode-go/glm-5.2"
  }
}
```

## Token Optimization

Add to `~/.config/mimocode/mimocode.jsonc`:

```jsonc
{
  "compaction": {
    "auto": true,
    "prune": true,
    "tail_turns": 3,
    "preserve_recent_tokens": 8000
  },
  "dream": { "auto": true, "interval_days": 3 },
  "distill": { "auto": true, "interval_days": 7 },
  "experimental": {
    "maxMode": { "candidates": 3 },
    "token_efficiency_heuristic": true
  }
}
```

**Total savings: ~60%**

## Cost Comparison

| Provider | Monthly Cost | Models |
|----------|--------------|--------|
| **OpenCode Go** | **$10** | All models |
| Xiaomi Token Plan | $50 | MiMo only |
| DeepSeek Direct | ~$39 | DeepSeek only |

## Documentation

- [OpenCode Go Setup](docs/opencode-go-setup.md)
- [Token Optimization](docs/token-optimization.md)
- [MCP Servers](docs/mcp-servers.md)

## License

MIT — use freely, modify as needed.
