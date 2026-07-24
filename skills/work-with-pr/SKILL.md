---
name: work-with-pr
description: Use when the user wants to work on a feature, bugfix, or task through a complete PR cycle. Covers isolated worktrees, implementation, testing, PR creation, and review.
---

# Work With PR

Full cycle: branch → implement → test → PR → review → merge.

## Workflow

### 1. Create Branch
```bash
git checkout -b feat/my-feature
# or
git checkout -b fix/my-bugfix
```

### 2. Implement
- Write code in small, focused commits
- Each commit should be one logical change
- Use conventional commit messages

### 3. Test
```bash
# Run full test suite
npm test

# Run linter
npm run lint

# Type check
npm run typecheck
```

### 4. Create PR
```bash
git add -A
git commit -m "feat: description"
git push -u origin feat/my-feature
gh pr create --title "feat: description" --body "Summary of changes"
```

### 5. PR Description Format
```markdown
## Summary
- What changed
- Why it changed

## Changes
- List of specific changes

## Testing
- How to test

## Notes
- Any additional context
```

### 6. Review
- Address review comments
- Push fixes as new commits
- Don't force-push during review

### 7. Merge
- Squash for clean history
- Delete branch after merge
- Update local main

## Best Practices

- Keep PRs small (< 400 lines)
- One feature per PR
- Include tests
- Update documentation if needed
- Link to issue if applicable
