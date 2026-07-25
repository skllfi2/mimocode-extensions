# Architecture

## Overview

MiMoCode Extensions is a modular plugin system for MiMoCode that provides hooks, tools, skills, workflows, rules, and TUI plugins to enhance the AI coding assistant experience.

## Directory Structure

```
mimocode-extensions/
├── hooks/              # Event handlers for MiMoCode lifecycle
├── tools/              # Custom tools for AI agents
├── skills/             # Specialized knowledge modules
├── rules/              # Code style and best practices
├── workflows/          # Multi-step automation scripts
├── tui/                # Terminal UI components
├── mcp/                # Model Context Protocol servers
├── docs/               # Documentation
├── tests/              # Test suite
├── examples/           # Example configurations
├── .github/            # GitHub templates and workflows
├── setup.sh            # Linux/macOS installer
├── setup.ps1           # Windows installer
├── auto-setup.sh       # Fully automated installer
├── auto-setup.ps1      # Fully automated Windows installer
└── plugin.ts           # Main plugin entry point
```

## Core Components

### 1. Hooks (27)

Hooks are event handlers that intercept MiMoCode lifecycle events.

| Category | Hooks | Purpose |
|----------|-------|---------|
| **Safety** | dangerous-command-guard, write-existing-file-guard, tool-pair-validator | Prevent destructive operations |
| **Validation** | error-pattern-validator, config-validator, winui-validator, test-validator, git-validator | Validate code and configuration |
| **Tracking** | resource-tracker, memory-tracker, session-tracker | Track state and resources |
| **Context** | rules-injector, directory-context, context-preservation | Inject context and rules |
| **Productivity** | intent-gate, todo-enforcer, goal, think-mode, start-work | Enhance productivity |
| **Recovery** | edit-error-recovery, json-error-recovery, error-explainer | Handle errors gracefully |
| **UI** | session-notification, output-truncator, empty-response-detector | Improve UI experience |

### 2. Tools (13)

Tools provide additional capabilities to AI agents.

| Tool | Purpose |
|------|---------|
| `weather` | Current weather via Open-Meteo API |
| `hashline` | Read files with LINE#ID content hashes |
| `json-query` | Query JSON data using dot-notation |
| `color-convert` | Convert colors between HEX, RGB, HSL |
| `uuid-gen` | Generate UUIDs, short IDs, hex tokens |
| `portable-pack` | Pack/unpack extensions for transfer |
| `git-smart` | Smart git operations |
| `file-hash` | Compute file hashes |
| `time-utils` | Convert timestamps, timezone info |
| `text-transform` | Case conversion, slug generation |
| `env-check` | Check tool availability |
| `look-at` | Analyze media files |
| `session-manager` | Session management utilities |

### 3. Skills (18)

Skills provide specialized knowledge for specific domains.

| Skill | Domain |
|-------|--------|
| `project-context` | Project understanding |
| `security-audit` | Security review |
| `git-master` | Git operations |
| `frontend-design` | UI/UX design |
| `database` | Database operations |
| `mcp-setup` | MCP configuration |
| `ultrawork` | Autonomous work |
| `code-review` | Code review |
| `api-design` | API design |
| `init-deep` | Project initialization |
| `tmux-mastery` | Terminal management |
| `debugging` | Debugging techniques |
| `prompt-engineering` | Prompt optimization |
| `docker` | Docker operations |
| `playwright` | Browser automation |
| `smart-rebase` | Git rebase |
| `work-with-pr` | Pull request workflow |
| `error-audit` | Error pattern auditing |

### 4. Rules (6)

Rules define code style and best practices.

| Rule | Content |
|------|---------|
| `code-style` | Naming, formatting, patterns |
| `commit-style` | Conventional commits |
| `security` | Security best practices |
| `performance` | Performance optimization |
| `anti-patterns` | Common mistakes to avoid |
| `error-prevention` | Error patterns and prevention |

### 5. Workflows (4)

Workflows are multi-step automation scripts.

| Workflow | Purpose |
|----------|---------|
| `pr-review` | Parallel PR review |
| `dep-audit` | Dependency audit |
| `full-audit` | Comprehensive audit |
| `quick-refactor` | Quick refactoring |

### 6. TUI Plugins (10)

TUI plugins enhance the terminal user interface.

| Plugin | Purpose |
|--------|---------|
| `plugin.ts` | Main plugin entry |
| `command-palette` | Command palette |
| `extensions-panel` | Extensions view |
| `quick-actions` | Quick action buttons |
| `session-dashboard` | Session info |
| `status-bar` | Live status |
| `status-panel` | Status details |
| `sidebar-enhanced` | Enhanced sidebar |
| `sidebar-menu` | Quick actions menu |
| `token-stats` | Token usage statistics |
| `mcp-panel` | MCP server management |

### 7. MCP Servers (6)

MCP servers provide external integrations.

| Server | Purpose |
|--------|---------|
| `filesystem` | File system access |
| `memory` | Knowledge graph memory |
| `github` | GitHub API |
| `sequential-thinking` | Problem solving |
| `postgres` | PostgreSQL database |
| `puppeteer` | Browser automation |

## Data Flow

```
User Input
    ↓
MiMoCode Core
    ↓
Hook System (27 hooks)
    ↓
Validation & Tracking
    ↓
Tool Execution (13 tools)
    ↓
Skill Loading (18 skills)
    ↓
Rule Application (6 rules)
    ↓
Output to User
```

## Configuration

### Global Config
`~/.config/mimocode/mimocode.jsonc`

### Project Config
`.mimocode/mimocode.jsonc`

### Extension Config
`.mimocode/` directory

## Installation

### Quick Install
```bash
curl -fsSL https://raw.githubusercontent.com/skllfi2/mimocode-extensions/main/setup.sh | bash
```

### Manual Install
```bash
git clone https://github.com/skllfi2/mimocode-extensions.git
cd mimocode-extensions
bash setup.sh
```

## Development

### Adding a Hook
1. Create `hooks/my-hook.ts`
2. Export a Hook object
3. Update README.md

### Adding a Tool
1. Create `tools/my-tool.ts`
2. Export a Tool object
3. Update README.md

### Adding a Skill
1. Create `skills/my-skill/SKILL.md`
2. Add frontmatter
3. Update README.md

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm run test:hooks
npm run test:install
```

## CI/CD

GitHub Actions workflow runs:
1. Tests on Node.js 18.x and 20.x
2. JSON/YAML validation
3. Secret detection
4. Component verification
