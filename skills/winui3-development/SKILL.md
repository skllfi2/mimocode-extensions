---
name: winui3-development
description: Specialized skill for WinUI 3 development with MiMoCode
---

# WinUI3 Development Skill

This skill provides specialized knowledge and workflows for WinUI 3 development with MiMoCode.

## When to Use

- Working with .cs files in WinUI 3 projects
- Editing XAML files
- Debugging WinUI 3 applications
- Refactoring WinUI 3 code
- Creating new WinUI 3 pages or components

## WinUI3 Project Structure

```
Project/
├── App.xaml(.cs)           # Composition root
├── MainWindow.xaml(.cs)    # Main window
├── Views/                  # XAML pages
├── ViewModels/             # MVVM ViewModels
├── Services/               # Business logic
├── Models/                 # Data models
├── Converters/             # Value converters
├── Helpers/                # Utility classes
├── Assets/                 # Images, icons
├── Styles/                 # XAML resource dictionaries
├── Themes/                 # Dark/Light themes
└── Platforms/              # Platform-specific code
```

## Critical WinUI3 Patterns

### 1. x:Bind Defaults to OneTime

```xml
<!-- ❌ WRONG: Value never updates -->
<TextBlock x:Bind Text="{x:Bind ViewModel.Name}"/>

<!-- ✅ CORRECT: Value updates when property changes -->
<TextBlock x:Bind Text="{x:Bind ViewModel.Name, Mode=OneWay}"/>
```

### 2. StaticResource vs ThemeResource

```xml
<!-- ❌ WRONG: Doesn't update on theme change -->
<Border Background="{StaticResource CardBrush}"/>

<!-- ✅ CORRECT: Updates automatically -->
<Border Background="{ThemeResource CardBrush}"/>
```

### 3. DispatcherQueue for UI Updates

```csharp
// ❌ WRONG: Cross-thread access
_vm.PropertyChanged += (_, e) => {
    StatusText.Text = "value"; // CRASH
};

// ✅ CORRECT: Use DispatcherQueue
_vm.PropertyChanged += (_, e) => {
    DispatcherQueue.TryEnqueue(() => StatusText.Text = "value");
};
```

### 4. Unsubscribe in Unloaded

```csharp
// ❌ WRONG: Memory leak
private void OnLoaded(...) {
    _vm.PropertyChanged += Handler;
}

// ✅ CORRECT: Unsubscribe
private void OnLoaded(...) {
    _vm.PropertyChanged += Handler;
}

private void OnUnloaded(...) {
    _vm.PropertyChanged -= Handler;
}
```

### 5. VirtualKey for Digits

```csharp
// ❌ WRONG: VirtualKey.D1-D9 don't exist
if (e.Key == VirtualKey.D1) { }

// ✅ CORRECT: Use Number1-Number9
if (e.Key == VirtualKey.Number1) { }
```

## Common Debugging Patterns

### InvalidCastException

**Cause**: Wrong converter or binding type
**Fix**: Check converter return type matches binding target

### Process Hangs

**Cause**: `WaitForExitAsync()` waits for stdout
**Fix**: Use poll loop `while (!proc.HasExited)`

### Memory Leaks

**Cause**: Event subscriptions without unsubscription
**Fix**: Always unsubscribe in Unloaded handler

## Integration with MiMoCode

This skill works with:
- `winui3-validator.ts` hook (validates patterns)
- `error-validator.ts` hook (prevents common errors)
- `performance-validator.ts` hook (checks for blocking UI)

## Quick Commands

```
/winui3-development    # Load this skill
/review-winui3         # Review WinUI3 code
/debug-winui3          # Debug WinUI3 issues
```
