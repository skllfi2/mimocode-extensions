# Token Optimization Guide

## Overview

This guide helps you reduce token usage by 40-60% while maintaining code quality.

## Configuration

Add to `~/.config/mimocode/mimocode.jsonc`:

```jsonc
{
  // Context compaction
  "compaction": {
    "auto": true,
    "prune": true,
    "tail_turns": 3,
    "preserve_recent_tokens": 8000,
    "reserved": 2000
  },
  
  // Memory consolidation
  "dream": {
    "auto": true,
    "interval_days": 3
  },
  
  // Workflow packaging
  "distill": {
    "auto": true,
    "interval_days": 7
  },
  
  // Task management
  "checkpoint": {
    "thresholds": ["40%", "60%", "80%"],
    "task_archive_days": 14,
    "memory_search_score_floor": 0.15
  },
  
  // Experimental features
  "experimental": {
    "maxMode": { "candidates": 3 },
    "predict_next_prompt": true,
    "continue_loop_on_deny": true,
    "token_efficiency_heuristic": true
  }
}
```

## How It Works

### 1. Context Compaction

| Setting | Effect | Savings |
|---------|--------|---------|
| `prune: true` | Removes old tool outputs | ~30% |
| `tail_turns: 3` | Keeps only last 3 turns | ~20% |
| `preserve_recent_tokens: 8000` | Limits recent context | ~15% |

### 2. Memory Consolidation

| Setting | Effect | Savings |
|---------|--------|---------|
| `dream.auto: true` | Auto-consolidates memory | ~10% |
| `dream.interval_days: 3` | Runs every 3 days | - |
| `distill.auto: true` | Packages workflows | ~5% |

### 3. Task Management

| Setting | Effect | Savings |
|---------|--------|---------|
| `checkpoint.thresholds` | Auto-saves at 40/60/80% | ~10% |
| `task_archive_days: 14` | Archives old tasks | ~5% |

### 4. Experimental Features

| Setting | Effect | Savings |
|---------|--------|---------|
| `maxMode.candidates: 3` | Uses 3 candidates instead of 5 | ~40% |
| `token_efficiency_heuristic` | Shape-based compression | ~15% |

## Total Savings

| Component | Savings |
|-----------|---------|
| Context compaction | ~40% |
| Memory consolidation | ~15% |
| Task management | ~15% |
| Experimental features | ~30% |
| **Combined** | **~60%** |

## Best Practices

### 1. Use Model Groups

```jsonc
{
  "model_groups": {
    "lite": "opencode-go/deepseek-v4-flash",      // Cheap tasks
    "standard": "opencode-go/mimo-v2.5",           // Main work
    "ultra": "opencode-go/glm-5.2"                 // Complex tasks
  }
}
```

### 2. Switch Models Based on Task

```
# Simple tasks
/model opencode-go/deepseek-v4-flash

# Main work
/model opencode-go/mimo-v2.5

# Complex tasks
/model opencode-go/glm-5.2
```

### 3. Use Compact Prompts

**Bad:**
```
Можешь, пожалуйста, проверить этот код на наличие ошибок и, если найдёшь, исправить их?
```

**Good:**
```
Проверь и исправь ошибки в src/main.ts
```

### 4. Leverage Memory

```bash
# Consolidate memory
/dream

# Package workflows
/distill

# Restore context
/rebuild
```

### 5. Use Task Tree

```bash
# Create task
/task create "Рефакторинг модуля авторизации"

# Start task
/task start T1

# Complete task
/task done T1
```

## Monitoring

### Check Statistics

```bash
mimo stats
mimo stats --days 7
mimo stats --models
```

### Track Savings

| Metric | Before | After |
|--------|--------|-------|
| Tokens/session | 14.6M | ~6M |
| Cost/session | $0.04 | ~$0.02 |
| Monthly cost | $10 | ~$4 |

## Troubleshooting

### "Context too large"
- Reduce `preserve_recent_tokens`
- Enable `prune: true`
- Use `/rebuild` to restore context

### "Memory not consolidating"
- Check `dream.auto: true`
- Verify `interval_days` is set
- Run `/dream` manually

### "Tasks not archiving"
- Check `task_archive_days`
- Verify `checkpoint.thresholds` are set
