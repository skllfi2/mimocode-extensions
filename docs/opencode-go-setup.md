# OpenCode Go Setup Guide

## Quick Start

### 1. Register for OpenCode Go

1. Visit https://opencode.ai
2. Sign up for an account
3. Subscribe to OpenCode Go ($10/month)

### 2. Get API Key

1. Go to Dashboard → API Keys
2. Click "Create API Key"
3. Copy the key (starts with `sk-go-`)

### 3. Configure MiMoCode

Add to `~/.config/mimocode/mimocode.jsonc`:

```jsonc
{
  "$schema": "https://mimo.xiaomi.com/mimocode/config.json",
  
  // Main model
  "model": "opencode-go/mimo-v2.5",
  
  // Provider configuration
  "provider": {
    "opencode-go": {
      "baseURL": "https://opencode.ai/zen/go/v1",
      "apiKey": "sk-go-your-api-key-here"
    }
  },
  
  // Model groups for different tasks
  "model_groups": {
    "lite": "opencode-go/deepseek-v4-flash",
    "standard": "opencode-go/mimo-v2.5",
    "ultra": "opencode-go/glm-5.2"
  }
}
```

## Available Models

| Model | Use Case | Input Cost | Output Cost |
|-------|----------|------------|-------------|
| `opencode-go/mimo-v2.5` | Main coding (best quality) | $0.14/1M | $0.28/1M |
| `opencode-go/deepseek-v4-flash` | Cheap tasks | $0.14/1M | $0.28/1M |
| `opencode-go/glm-5.2` | Complex tasks | $1.40/1M | $4.40/1M |
| `opencode-go/qwen3.7-plus` | Alternative | $0.32/1M | $1.28/1M |
| `opencode-go/minimax-m3` | Fast utility | $0.30/1M | $1.20/1M |

## Cost Comparison

| Provider | Monthly Cost | Models Included |
|----------|--------------|-----------------|
| **OpenCode Go** | **$10** | All models above |
| Xiaomi Token Plan | $50 | MiMo V2.5 only |
| DeepSeek Direct | ~$39 | DeepSeek only |

## Model Selection Strategy

### Use `lite` (DeepSeek V4 Flash) for:
- Simple code reviews
- Documentation generation
- Test writing
- Quick fixes

### Use `standard` (MiMo V2.5) for:
- Main coding tasks
- Complex implementations
- Architecture decisions

### Use `ultra` (GLM-5.2) for:
- Hard logic problems
- Complex refactoring
- System design

## Switching Models

In MiMoCode, press `Tab` to cycle through agents, or use:

```
/model opencode-go/deepseek-v4-flash
/model opencode-go/mimo-v2.5
/model opencode-go/glm-5.2
```

## Troubleshooting

### "API key invalid"
- Check your API key starts with `sk-go-`
- Ensure OpenCode Go subscription is active

### "Model not found"
- Verify model name in config
- Check OpenCode Go documentation for available models

### "Connection refused"
- Check internet connection
- Verify baseURL is correct: `https://opencode.ai/zen/go/v1`
