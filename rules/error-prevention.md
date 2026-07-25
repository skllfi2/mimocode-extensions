# Error Prevention Rules

## Overview

These rules are derived from analysis of 37 days of development across 9 projects. They prevent common errors before they occur.

---

## WinUI 3 Rules

### Type Safety
- Always use `Assert.IsType<T>()` instead of type assertions
- Test converters via hex string comparison, not brush objects
- Use `JsonIgnoreCondition` instead of `SerializationCondition` (.NET 10)

### Data Binding
- Always add `Mode=OneWay` to x:Bind for computed properties
- Never bind bool directly to Visibility - use converter
- Handle null in bindings with `FallbackValue`

### Process Management
- Use `using` statements for all IDisposable resources
- Track process handles with `SafeProcessHandle`
- Never use `async void` in Page constructors

### Event Handling
- Always unsubscribe from PropertyChanged in Unloaded handler
- Use `VirtualKey.Number1` not `VirtualKey.D1` for digit keys
- Check `sender is Button btn && btn.Tag is string` pattern

---

## Resource Management Rules

### IDisposable Pattern
```csharp
// CORRECT
using var process = new Process();
process.Start();

// WRONG
var process = new Process();
process.Start();
// Missing disposal
```

### HttpClient Usage
```csharp
// CORRECT - Singleton
private static readonly HttpClient _client = new();

// WRONG - Creates new instance
var client = new HttpClient();
```

### Process Lifecycle
```csharp
// CORRECT
try
{
    process.Start();
    await process.WaitForExitAsync(ct);
}
finally
{
    if (!process.HasExited)
    {
        process.Kill();
    }
    process.Dispose();
}
```

---

## Testing Rules

### Test Isolation
- Never depend on external state in tests
- Use mocks for all external dependencies
- Clean up resources in Dispose/finally

### Async Testing
- Use `Assert.ThrowsAsync<T>` not `Assert.Throws<T>`
- Always pass CancellationToken to async methods
- Use `Task.Delay` with cancellation for timeouts

### Mock Behavior
- Verify mock behavior matches real implementation
- Use `It.IsAny<T>()` sparingly - prefer specific values
- Reset mocks between tests

---

## Configuration Rules

### Path Validation
- Always validate file paths before use
- Use `Path.GetFullPath()` to normalize paths
- Check `File.Exists()` before file operations

### Environment Variables
- Validate required environment variables at startup
- Provide clear error messages for missing variables
- Use fallback values when appropriate

### API Endpoints
- Validate API endpoints before making requests
- Use health checks for external services
- Implement retry logic for transient failures

---

## Documentation Rules

### Project Tracking
- Register all projects in global memory
- Update project status regularly
- Document architectural decisions

### Code Documentation
- Document public APIs
- Explain complex algorithms
- Include usage examples

### Change Documentation
- Update CHANGELOG for all changes
- Document breaking changes clearly
- Include migration guides

---

## Git Rules

### Commit Messages
- Use conventional commits format
- Keep subject line under 72 characters
- Reference issues when applicable

### Branch Management
- Never force push to main/master
- Create backups before destructive operations
- Use meaningful branch names

### .gitignore
- Always include .gitignore in new projects
- Never commit secrets or API keys
- Ignore build artifacts and dependencies

---

## Quick Reference

### Before Writing Code
1. Check for existing patterns in codebase
2. Validate configuration and paths
3. Review error prevention rules

### Before Committing
1. Run tests
2. Check for warnings
3. Review changes

### Before Pushing
1. Verify no secrets committed
2. Check .gitignore
3. Review commit history
