---
name: prompt-engineering
description: Use when crafting or improving prompts for AI models. Covers prompt patterns, few-shot examples, chain-of-thought, and optimization techniques.
---

# Prompt Engineering

## Core Principles

1. **Be specific** — vague prompts get vague results
2. **Provide context** — background information helps
3. **Show examples** — few-shot learning works
4. **Break down complex tasks** — step-by-step instructions
5. **Define output format** — specify what you want back

## Prompt Patterns

### Zero-shot
```
Classify the sentiment: "This movie was great!"
```

### Few-shot
```
Classify sentiment:
"The food was terrible" → negative
"I love this place" → positive
"The weather is nice" →
```

### Chain-of-Thought
```
Solve this step by step:
1. First, identify the variables
2. Then, set up the equation
3. Finally, solve for x
```

### Role-based
```
You are a senior security auditor. Review this code for vulnerabilities...
```

### Structured Output
```
Return your response as JSON:
{
  "summary": "...",
  "issues": [...],
  "recommendations": [...]
}
```

## Optimization Tips

- **Iterate**: Start simple, add complexity as needed
- **Test edge cases**: Verify with different inputs
- **A/B test**: Compare prompt variations
- **Measure**: Track success rates
- **Version control**: Keep prompt history
