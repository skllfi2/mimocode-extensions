# WinUI3 Patterns and Anti-Patterns

## Based on Real Issues from ZuiV2

---

## 1. UI Thread Access (Самая частая ошибка)

### ❌ НЕЛЬЗЯ
```csharp
_vm.PropertyChanged += (_, args) => {
    StatusText.Text = "value"; // CRASH: cross-thread access
};
```

### ✅ НУЖНО
```csharp
_vm.PropertyChanged += (_, args) => {
    DispatcherQueue.TryEnqueue(() => StatusText.Text = "value");
};
```

**Правило**: Все обращения к UI элементам из фоновых потоков должны проходить через `DispatcherQueue.TryEnqueue()`.

---

## 2. StaticResource vs ThemeResource

### ❌ НЕ обновляется при смене темы runtime
```xml
<Border Background="{StaticResource CardBackgroundBrush}"/>
```

### ✅ Обновляется автоматически
```xml
<Border Background="{ThemeResource CardBackgroundBrush}"/>
```

**Правило**: Используйте `{ThemeResource}` для brush, которые должны обновляться при смене темы.

---

## 3. Unloaded Event и утечки памяти

### ❌ Подписка в OnLoaded без отписки
```csharp
private void OnLoaded(...) {
    _vm.PropertyChanged += Handler;
}
// Handler никогда не отписывается → утечка памяти
```

### ✅ Правильная отписка
```csharp
private void OnLoaded(...) {
    _vm.PropertyChanged += Handler;
}

private void OnUnloaded(...) {
    _vm.PropertyChanged -= Handler;
}
```

**Правило**: Каждая подписка в `OnLoaded` должна иметь соответствующую отписку в `OnUnloaded`.

---

## 4. NavigationCacheMode и DataContext

### Проблема
При `NavigationCacheMode="Enabled"` страница не пересоздаётся при навигации. DataContext сохраняется, но `OnLoaded` вызывается заново.

### Решение
```csharp
protected override void OnNavigatedTo(NavigationEventArgs e) {
    base.OnNavigatedTo(e);
    // Восстановить состояние здесь
}

private void OnLoaded(...) {
    // Не дублируйте инициализацию из OnNavigatedTo
}
```

**Правило**: Разделяйте логику между `OnNavigatedTo` (восстановление состояния) и `OnLoaded` (UI инициализация).

---

## 5. ProgressBar и async операции

### ❌ ProgressBar без DispatcherQueue
```csharp
private async Task InstallUpdateAsync() {
    progressBar.Value = 50; // CRASH: из Task.Run
}
```

### ✅ Через DispatcherQueue
```csharp
private async Task InstallUpdateAsync() {
    DispatcherQueue.TryEnqueue(() => progressBar.Value = 50);
}
```

**Правило**: Обновляйте ProgressBar только через `DispatcherQueue.TryEnqueue()`.

---

## 6. TextBox Binding и двусторонняя привязка

### ❌ Конфликт binding и ручного обновления
```xml
<TextBox Text="{Binding Foo, Mode=TwoWay}"/>
```
```csharp
FooTextBox.Text = "new value"; // Перезапишет binding
```

### ✅ Используйте только binding
```xml
<TextBox Text="{Binding Foo, Mode=TwoWay}"/>
```
```csharp
// Обновляйте через ViewModel
ViewModel.Foo = "new value";
```

**Правило**: Не обновляйте `Text` вручную при использовании `TwoWay` binding.

---

## 7. ItemsSource и ObservableCollection

### ❌ List<> не обновляется автоматически
```csharp
public List<string> Items { get; set; } = new();
```

### ✅ ObservableCollection обновляется автоматически
```csharp
public ObservableCollection<string> Items { get; set; } = new();
```

**Правило**: Используйте `ObservableCollection<T>` для `ItemsSource`, если список изменяется во время выполнения.

---

## Чек-лист перед коммитом

- [ ] Все UI обращения из фоновых потоков через `DispatcherQueue.TryEnqueue()`
- [ ] Brush используют `{ThemeResource}` для динамических тем
- [ ] Каждая подписка в `OnLoaded` имеет отписку в `OnUnloaded`
- [ ] `NavigationCacheMode` совместим с логикой навигации
- [ ] ProgressBar обновляется через `DispatcherQueue.TryEnqueue()`
- [ ] TextBox не конфликтует с binding
- [ ] ItemsSource использует `ObservableCollection<T>`

---

## Быстрая проверка

```bash
# Найти StaticResource Brush
grep -r "StaticResource.*Brush" --include="*.xaml" .

# Найти подписки без отписки
grep -r "PropertyChanged.*+=" --include="*.cs" .
grep -r "PropertyChanged.*-=" --include="*.cs" .

# Найти ручные обновления TextBox
grep -r "\.Text\s*=" --include="*.cs" .
```
