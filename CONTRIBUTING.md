# Contributing to MiMoCode Extensions

Thank you for your interest in contributing! This document provides guidelines and steps for contributing.

## How to Contribute

### 1. Fork the Repository

```bash
# Fork on GitHub, then clone
git clone https://github.com/YOUR_USERNAME/mimocode-extensions.git
cd mimocode-extensions
```

### 2. Create a Branch

```bash
git checkout -b feature/amazing-feature
```

### 3. Make Changes

- Follow the existing code style
- Add comments for complex logic
- Test your changes

### 4. Commit Changes

```bash
git commit -m "Add amazing feature"
```

Use clear commit messages:
- `feat: add new feature`
- `fix: fix bug`
- `docs: update documentation`
- `style: format code`
- `refactor: refactor code`
- `test: add tests`
- `chore: update dependencies`

### 5. Push to Branch

```bash
git push origin feature/amazing-feature
```

### 6. Open a Pull Request

Go to GitHub and create a Pull Request.

## Development Setup

### Prerequisites

- Node.js 18+
- npm 9+
- Git

### Local Development

```bash
# Clone the repo
git clone https://github.com/skllfi2/mimocode-extensions.git
cd mimocode-extensions

# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```

## Adding Components

### Adding a Hook

1. Create `hooks/my-hook.ts`
2. Export a TypeScript hook
3. Update `README.md`

### Adding a Tool

1. Create `tools/my-tool.ts`
2. Export a TypeScript tool
3. Update `README.md`

### Adding a Skill

1. Create `skills/my-skill/SKILL.md`
2. Add frontmatter with name and description
3. Update `README.md`

### Adding a Rule

1. Create `rules/my-rule.md`
2. Write the rule content
3. Update `README.md`

### Adding a Workflow

1. Create `workflows/my-workflow.js`
2. Export a JavaScript workflow
3. Update `README.md`

### Adding a TUI Plugin

1. Create `tui/my-plugin.tsx`
2. Export a TUI plugin
3. Update `README.md`

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer `const` over `let`
- Use early returns
- Add types for function parameters

### JavaScript

- Use ES6+ features
- Prefer `const` over `let`
- Use async/await

### Markdown

- Use clear headings
- Add code examples
- Keep lines under 80 characters

## Testing

```bash
# Run all tests
npm test

# Run specific test
npm test -- --grep "test name"
```

## Documentation

- Update `README.md` for new features
- Add examples in `examples/`
- Update `CHANGELOG.md`

## Questions?

Open an issue on GitHub.
