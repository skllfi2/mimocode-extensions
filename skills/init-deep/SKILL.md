---
name: init-deep
description: Use when the user wants to generate hierarchical AGENTS.md files throughout a project. Creates context-aware documentation at each directory level for better agent understanding.
---

# /init-deep

Generates hierarchical context files so agents understand each part of your project.

## What It Does

Scans your project and creates `AGENTS.md` (or `CONTEXT.md`) files at each directory level:

```
project/
├── AGENTS.md              ← project-wide context
├── src/
│   ├── AGENTS.md          ← src-specific context
│   └── components/
│       └── AGENTS.md      ← component-specific context
├── tests/
│   └── AGENTS.md          ← test conventions
└── docs/
    └── AGENTS.md          ← documentation structure
```

## How to Generate

Ask me:

```
/init-deep
```

Or:

```
Generate hierarchical AGENTS.md files for this project
```

## What Gets Written

Each `AGENTS.md` contains:
- **Purpose**: What this directory does
- **Key files**: Important files and their roles
- **Conventions**: Code style, naming patterns
- **Dependencies**: What this module depends on
- **Testing**: How to test this module

## Token Efficiency

By having context at each level, agents only load relevant context for the task at hand. No need to read the entire project structure every time.
