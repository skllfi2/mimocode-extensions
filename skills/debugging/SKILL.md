---
name: debugging
description: Use when debugging issues, diagnosing errors, or troubleshooting problems. Covers systematic debugging, logging, profiling, and common patterns.
---

# Debugging Guide

## Systematic Approach

1. **Reproduce** — create a minimal test case
2. **Isolate** — narrow down the problem
3. **Hypothesize** — form a theory
4. **Test** — verify the theory
5. **Fix** — implement the solution
6. **Verify** — confirm the fix works
7. **Document** — record what happened

## Common Patterns

### Silent Failures
- Check for empty catch blocks
- Look for `||` or `??` with fallback hiding errors
- Add logging before error paths

### Timing Issues
- Race conditions: check async/await usage
- Memory pressure: check for leaks
- GC pauses: profile heap usage

### State Bugs
- Trace state changes through the flow
- Add assertions at state transitions
- Use immutable data where possible

## Debugging Tools

### Node.js
```bash
# Debug inspector
node --inspect server.js

# Break on first line
node --inspect-brk server.js

# Log with timestamps
NODE_DEBUG=* node server.js
```

### Console Techniques
```javascript
console.table(data)          // Tabular data
console.time("label")        // Timer
console.timeEnd("label")     // End timer
console.trace()              // Stack trace
console.dir(obj, {depth: null}) // Full object
```

### Performance
```bash
# CPU profile
node --cpu-prof server.js

# Memory snapshot
node --heapprod server.js

# Trace GC
node --trace-gc server.js
```

## Common Fixes

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| ECONNREFUSED | Server not running | Start the server |
| ENOENT | Wrong path | Check file path |
| EACCES | Permissions | Check file permissions |
| ENOMEM | Memory leak | Profile and fix leak |
| ETIMEDOUT | Network issue | Check connectivity |
