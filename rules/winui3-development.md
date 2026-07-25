# WinUI3 Development Rules

## Overview

Rules for working with WinUI 3 projects in MiMoCode.

## Project Structure Rules

### 1. File Organization

- **Views/**: XAML pages only, no code-behind logic
- **ViewModels/**: MVVM ViewModels with INotifyPropertyChanged
- **Services/**: Business logic, API calls, data processing
- **Models/**: Data models, DTOs, records
- **Converters/**: One file per converter, file-scoped namespaces
- **Helpers/**: Static utility classes

### 2. Naming Conventions

- Pages: `XxxPage.xaml` / `XxxPage.xaml.cs`
- ViewModels: `XxxViewModel.cs`
- Services: `IXxxService` (interface) + `XxxService` (implementation)
- Converters: `XxxToYyyConverter.cs`

## Code Rules

### 1. Always Use DispatcherQueue for UI

```csharp
// ❌ WRONG
StatusText.Text = "value";

// ✅ CORRECT
DispatcherQueue.TryEnqueue(() => StatusText.Text = "value");
```

### 2. Always Unsubscribe Events

```csharp
// In OnLoaded
_vm.PropertyChanged += Handler;

// In OnUnloaded
_vm.PropertyChanged -= Handler;
```

### 3. Use Mode=OneWay for Dynamic Bindings

```xml
<!-- ❌ WRONG: Value never updates -->
<x:Bind Text="{x:Bind ViewModel.Name}"/>

<!-- ✅ CORRECT: Value updates -->
<x:Bind Text="{x:Bind ViewModel.Name, Mode=OneWay}"/>
```

### 4. Use ThemeResource for Theme-Aware Brushes

```xml
<!-- ❌ WRONG: Static on theme change -->
<Border Background="{StaticResource CardBrush}"/>

<!-- ✅ CORRECT: Updates on theme change -->
<Border Background="{ThemeResource CardBrush}"/>
```

### 5. Use VirtualKey.NumberX for Digits

```csharp
// ❌ WRONG
VirtualKey.D1, VirtualKey.D2, VirtualKey.D3

// ✅ CORRECT
VirtualKey.Number1, VirtualKey.Number2, VirtualKey.Number3
```

## Testing Rules

### 1. Kill Stale Processes Before Tests

```csharp
[KillZapretBinaries] // Attribute or method call
public async Task RunTestAsync() { ... }
```

### 2. Use Poll Loop for Process Wait

```csharp
// ❌ WRONG: May hang
await process.WaitForExitAsync();

// ✅ CORRECT: Poll with timeout
while (!process.HasExited && sw.ElapsedMilliseconds < timeout)
{
    await Task.Delay(100);
}
```

### 3. Propagate CancellationToken

```csharp
// ❌ WRONG
await StopAsync(CancellationToken.None);

// ✅ CORRECT
await StopAsync(cancellationToken);
```

## Performance Rules

### 1. Avoid Blocking UI

```csharp
// ❌ WRONG
Thread.Sleep(1000);
await Task.Delay(1000).Result;

// ✅ CORRECT
await Task.Delay(1000, cancellationToken);
```

### 2. Use Async/Avoid Async Void

```csharp
// ❌ WRONG: Exceptions swallowed
async void OnButtonClick() { ... }

// ✅ CORRECT: Async Task
private async Task OnButtonClickAsync() { ... }
```

## Debugging Tips

### 1. Check Log Files First

```powershell
# Check application logs
Get-Content "logs\zapretui_*.log" -Tail 100
```

### 2. Use First-Chance Exceptions

```
Debug → Exception Settings → Check all .NET exceptions
```

### 3. Check GlobalUsings.cs

If you see mass CS0246 errors, check `GlobalUsings.cs` for missing usings.

## Common Mistakes to Avoid

| Mistake | Problem | Fix |
|---------|---------|-----|
| StaticResource for brushes | No theme update | Use ThemeResource |
| x:Bind without Mode=OneWay | Value never updates | Add Mode=OneWay |
| Subscribe without unsubscribe | Memory leak | Unsubscribe in Unloaded |
| VirtualKey.D1-D9 | Wrong keys | Use Number1-Number9 |
| WaitForExitAsync | May hang | Use poll loop |
| Environment.Exit(0) | Unreliable | Use Process.Kill() |
