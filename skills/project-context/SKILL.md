---
name: project-context
description: Auto-loaded project context for this workspace. Use to understand project conventions, architecture, and preferences.
---

# Project Context

## Architecture

This is the MiMoCode configuration directory. Custom extensions (hooks, tools, skills, workflows) live here.

## Conventions

- Hooks go in `.mimocode/hooks/` as TypeScript files
- Rules go in `.mimocode/rules/` as markdown files (auto-injected into system prompt)
- Skills go in `.mimocode/skills/<name>/SKILL.md`
- Workflows go in `.mimocode/workflows/*.js`
- TUI plugins go in `.mimocode/tui/*.tsx`

## Hot-Reload

- Hooks and tools: next turn
- Skills: next turn
- Workflows: on invoke
- TUI: restart required
