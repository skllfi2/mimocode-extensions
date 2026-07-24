---
name: code-review
description: Use when reviewing code changes. Provides structured review checklist and common issues to check.
---

# Code Review Checklist

## Correctness
- [ ] Does the code do what it claims?
- [ ] Are edge cases handled (empty input, null, overflow)?
- [ ] Are error paths handled?
- [ ] Is the logic correct for all input combinations?

## Security
- [ ] Is user input validated/sanitized?
- [ ] Are secrets kept out of code?
- [ ] Are permissions checked?
- [ ] Is the principle of least privilege followed?

## Performance
- [ ] Are there N+1 queries?
- [ ] Are there unnecessary allocations in hot paths?
- [ ] Is caching used where appropriate?
- [ ] Are database queries optimized?

## Maintainability
- [ ] Is the code readable without comments?
- [ ] Are functions small and focused?
- [ ] Is there duplication that should be extracted?
- [ ] Are names descriptive and consistent?

## Testing
- [ ] Are new code paths tested?
- [ ] Are edge cases covered?
- [ ] Do tests verify behavior, not implementation?

## Style
- [ ] Follows project conventions?
- [ ] No AI slop words (clearly, simply, robust, leverage)?
- [ ] Consistent formatting?
