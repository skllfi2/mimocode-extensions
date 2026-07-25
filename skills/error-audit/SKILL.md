---
name: error-audit
description: Audit code for common error patterns and suggest fixes
---

# Error Audit Skill

This skill audits code for common error patterns based on analysis of 37 days of development across 9 projects.

## When to Use

- Before committing code
- When reviewing pull requests
- When onboarding to a new project
- When debugging recurring issues

## What It Checks

### 1. WinUI 3 Patterns
- Type cast safety
- Data binding correctness
- Process lifecycle management
- Event handler cleanup

### 2. Resource Management
- IDisposable usage
- HttpClient lifecycle
- Process handle management
- Memory leaks

### 3. Testing Patterns
- Test isolation
- Mock consistency
- Async test handling
- Resource cleanup

### 4. Configuration
- Path validation
- Environment variables
- API endpoints
- Error handling

### 5. Documentation
- Project tracking
- Code documentation
- Change documentation

### 6. Runtime State (NEW)
- File contents (not just existence)
- Settings values (not just code structure)
- Directory contents
- Empty files and directories
- Null/default values in settings

## How to Use

### Quick Audit
```
/error-audit
```

### Audit Specific File
```
/error-audit src/MyFile.cs
```

### Audit Directory
```
/error-audit src/
```

## Output Format

The audit produces a report with:
- **Critical Issues**: Must fix before commit
- **Warnings**: Should fix soon
- **Suggestions**: Nice to have improvements

## Example Output

```
## Error Audit Report

### Critical Issues (2)
1. **Process handle leak** in `ProcessManager.cs:45`
   - New Process() without using statement
   - Fix: Add `using` or implement IDisposable

2. **Async void in constructor** in `MainPage.xaml.cs:12`
   - Can cause unhandled exceptions
   - Fix: Use async Task initialization pattern

### Warnings (3)
1. **HttpClient created per request** in `ApiClient.cs:67`
   - Fix: Use singleton HttpClient

2. **Missing null check** in `DataProcessor.cs:89`
   - Fix: Add null validation

3. **x:Bind without Mode** in `StrategyPage.xaml:23`
   - Fix: Add Mode=OneWay if property changes

### Suggestions (2)
1. Consider adding cancellation token to async methods
2. Add XML documentation to public APIs
```

## Integration

This skill works with:
- `error-pattern-validator` hook (prevents issues)
- `resource-tracker` hook (tracks resources)
- `winui-validator` hook (WinUI-specific checks)
- `runtime-state-validator` hook (checks runtime state)

## Customization

Add project-specific patterns to `rules/error-prevention.md` and `rules/runtime-validation.md`.

## Common Runtime State Issues

### Issue: Version Shows "—"
**Cause**: Setting is null in settings.json
**Fix**: Set actual value in settings

### Issue: Empty Files
**Cause**: File exists but has no content
**Fix**: Add expected content or remove file

### Issue: Empty Directories
**Cause**: Directory exists but has no files
**Fix**: Add expected files or remove directory

### Issue: Placeholder Values
**Cause**: Settings contain "—", "TODO", etc.
**Fix**: Replace with actual values
