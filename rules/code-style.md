# Code Style Rules

- Prefer `const` over `let` — never use `var`
- Use early returns to reduce nesting
- Functions should do one thing well
- No magic numbers — extract to named constants
- Max function length: ~30 lines. If longer, extract helpers
- Prefer named exports over default exports
- No barrel files (`index.ts` that only re-exports)
- No empty catch blocks
