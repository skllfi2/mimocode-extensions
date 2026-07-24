---
name: tmux-mastery
description: Use when working with tmux sessions, windows, and panes. Covers session management, scripting, layouts, and automation.
---

# Tmux Mastery

## Session Management

```bash
# Create named session
tmux new -s work

# List sessions
tmux ls

# Attach to session
tmux attach -t work

# Kill session
tmux kill-session -t work
```

## Window Management

```bash
# New window (in session)
Ctrl+b c

# Rename window
Ctrl+b ,

# Switch windows
Ctrl+b 0-9

# Move window
Ctrl+b .
```

## Pane Management

```bash
# Split horizontal
Ctrl+b "

# Split vertical
Ctrl+b %

# Navigate panes
Ctrl+b Arrow

# Resize pane
Ctrl+b Ctrl+Arrow

# Toggle pane zoom
Ctrl+b z
```

## Scripting

```bash
# Create session with layout
tmux new-session -d -s work -n editor
tmux send-keys -t work:0 'nvim .' Enter
tmux split-window -h -t work:0
tmux send-keys -t work:0 'git status' Enter
tmux attach -t work
```

## Useful Patterns

### Dev Environment
```bash
tmux new-session -d -s dev
tmux send-keys -d 'npm run dev' Enter
tmux split-window -h
tmux send-keys 'npm test --watch' Enter
tmux split-window -v
tmux send-keys 'git log --oneline -10' Enter
tmux attach -t dev
```

### Remote Work
```bash
# Persistent session over SSH
ssh -t server tmux attach -t work

# Detach without closing
Ctrl+b d
```
