---
name: smart-rebase
description: Use when rebasing branches, resolving merge conflicts, or cleaning up git history. Covers interactive rebase, conflict resolution, and history rewriting.
---

# Smart Rebase

## When to Rebase

- Before creating a PR (clean up commits)
- When branch is behind main
- To squash fixup commits
- To reorder commits

## Basic Rebase

```bash
# Rebase onto main
git rebase main

# Continue after resolving conflicts
git rebase --continue

# Abort rebase
git rebase --abort
```

## Interactive Rebase

```bash
# Rebase last 5 commits
git rebase -i HEAD~5
```

### Commands
- `pick` — keep commit as-is
- `reword` — keep commit, edit message
- `edit` — pause for changes
- `squash` — merge with previous, combine messages
- `fixup` — merge with previous, discard message
- `drop` — remove commit

## Conflict Resolution

### During Rebase
```bash
# Files with conflicts
git status

# Edit conflicted files
# Look for <<<<<<< ======= >>>>>>> markers

# After resolving
git add <file>
git rebase --continue
```

### Common Patterns

#### Both modified
```typescript
<<<<<<< HEAD
const x = 1
=======
const x = 2
>>>>>>> their-branch
```
Choose one or combine.

#### Rename conflict
```bash
# Keep ours
git checkout --ours <file>

# Keep theirs
git checkout --theirs <file>
```

## Squash Commits

```bash
# Squash last 3 commits
git rebase -i HEAD~3

# Mark commits to squash
pick abc1234 First commit
fixup def5678 Fix typo
fixup ghi9012 Another fix
```

## Fixup workflow

```bash
# Make a fixup commit
git commit --fixup=abc1234

# Auto-squash during rebase
git rebase -i --autosquash main
```

## Safety Rules

- Never rebase pushed commits (shared history)
- Always have a backup branch before rebasing
- Test after rebasing
- Use `--force-with-lease` instead of `--force`
