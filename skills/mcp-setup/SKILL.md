---
name: mcp-setup
description: Use when setting up MCP servers for MiMoCode. Covers configuration, available servers, and integration patterns.
---

# MCP Setup Guide

## Available MCP Servers (from oh-my-openagent)

### 1. Websearch (Exa)
- **Purpose**: Web search with semantic understanding
- **Config**: Remote URL, requires API key
- **Tools**: `websearch`, `webfetch`

### 2. Context7
- **Purpose**: Official documentation lookup for libraries/frameworks
- **Config**: Remote URL (free tier available)
- **Tools**: `resolve-library-id`, `get-library-docs`

### 3. Grep.app
- **Purpose**: Search code across all public GitHub repos
- **Config**: Remote URL (free)
- **Tools**: `grep_app_search_code`, `grep_app_search_path`

### 4. LSP
- **Purpose**: IDE-level code intelligence (diagnostics, rename, goto definition)
- **Config**: Local stdio, requires language servers installed
- **Tools**: `lsp_diagnostics`, `lsp_rename`, `lsp_goto_definition`, `lsp_find_references`

### 5. Codegraph
- **Purpose**: Code dependency graph and analysis
- **Config**: Local stdio
- **Tools**: `codegraph_query`, `codegraph_impact`

## Adding MCP to MiMoCode

MCP servers are configured in the MiMoCode settings. Example:

```json
{
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    },
    "grep_app": {
      "type": "remote", 
      "url": "https://grep.app/api/mcp"
    }
  }
}
```

## Recommended MCP Stack

For general development:
- **Context7** — always on for docs
- **Grep.app** — code search across GitHub

For frontend:
- Add LSP for your framework (TypeScript, CSS, HTML)

For research:
- **Websearch** — semantic web search
