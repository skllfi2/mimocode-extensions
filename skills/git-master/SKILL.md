---
name: git-master
description: Use when performing complex git operations: interactive rebase, bisect, worktree management, atomic commits, conflict resolution, or history rewriting.
---

# Git Master

## Atomic Commits

Each commit should be one logical change. If a feature requires multiple steps, commit each step separately.

## Interactive Rebase Rules

- Never rebase commits that have been pushed to a shared branch
- Use `fixup` over `squash` when the commit message is irrelevant
- Use `reword` for fixing typos in commit messages

## Worktree Management

```bash
# Create worktree for feature
git worktree add ../feature-name feature-branch

# List worktrees
git worktree list

# Remove after merge
git worktree remove ../feature-name
```

## Conflict Resolution

1. Read both sides carefully
2. Prefer the version that preserves intent, not just syntax
3. Run tests after resolving conflicts
4. Commit the resolution as its own commit

## Bisect

```bash
# Automated bisect
git bisect start
git bisect bad          # current commit is broken
git bisect good v1.0.0  # this version was working
git bisect run npm test # automated test
```
