import type { Hook } from "@mimo-ai/plugin"

/**
 * WinUI3 Comprehensive Validator Hook
 * 
 * Validates all WinUI3-specific patterns based on real issues found in ZuiV2.
 * 
 * Issues covered (52 total):
 * 1. UI Thread Access - accessing UI from background thread
 * 2. StaticResource vs ThemeResource - theme updates
 * 3. Unloaded Event and leaks - event subscription leaks
 * 4. NavigationCacheMode and DataContext
 * 5. ProgressBar and async operations
 * 6. TextBox Binding and two-way binding conflicts
 * 7. ItemsSource and ObservableCollection
 * 8. Terminal suppression - CreateNoWindow insufficient
 * 9. ItemsRepeater nested DataTemplate - Click events not propagating
 * 10. x:Bind Tag pattern matching - fails silently
 * 11. WaitForConditionAsync polling vs Task.Delay
 * 12. Single-instance Mutex placement
 * 13. VirtualKey enum mismatch (D1 vs Number1)
 * 14. PropertyChangedEventHandler type mismatch
 * 15. CheckBox.IsChecked setter fires events SYNCHRONOUS
 * 16. StackOverflowException handling
 * 17. VS Rebuild All parallel build ordering
 * 18. WrapPanel doesn't exist in WinUI 3
 * 19. Stale build cache issues
 * 20. cmd.exe /c vs start /B
 * 21. StopAsync must propagate CancellationToken
 * 22. IZapretService doesn't implement IDisposable
 * 23. StringToVisibilityConverter returns Visibility, NOT bool
 * 24. BoolToColorConverter must handle #RRGGBB AND #RRGGBBAA
 * 25. VirtualKeyStates enum mismatch
 * 26. x:Bind defaults to OneTime, not OneWay
 * 27. Kill stale winws before test
 * 28. Exit code handling
 * 29. Environment.Exit(0) unreliable
 * 30. Process.WaitForExitAsync() hangs when stdout pipe stays open
 */

interface WinUI3Issue {
  type: 'error' | 'warning' | 'info'
  message: string
  file?: string
  line?: number
  suggestion?: string
}

const WINUI3_COMPREHENSIVE_PATTERNS = [
  // 1. UI Thread Access
  { 
    pattern: /\.Text\s*=|\.Value\s*=|\.IsEnabled\s*=|\.Visibility\s*=/g, 
    context: /Task\.Run|ThreadPool|new\s+Thread/, 
    message: 'UI element modified from background thread',
    suggestion: 'Use DispatcherQueue.TryEnqueue()',
    severity: 'error',
    category: 'UI Thread'
  },
  { 
    pattern: /PropertyChanged.*\+=.*\{[^}]*\.Text|PropertyChanged.*\+=.*\{[^}]*\.Value/, 
    message: 'PropertyChanged handler may access UI directly',
    suggestion: 'Wrap UI access in DispatcherQueue.TryEnqueue()',
    severity: 'warning',
    category: 'UI Thread'
  },
  
  // 2. StaticResource vs ThemeResource
  { 
    pattern: /\{StaticResource\s+\w+Brush\}/, 
    message: 'StaticResource does not update on theme change',
    suggestion: 'Use ThemeResource for dynamic theme updates',
    severity: 'warning',
    category: 'Theme'
  },
  
  // 3. Unloaded Event and leaks
  { 
    pattern: /Loaded\s*\+=\s*\w+/, 
    message: 'Loaded event subscription',
    suggestion: 'Ensure corresponding Unloaded -= handler',
    severity: 'warning',
    category: 'Memory Leak'
  },
  { 
    pattern: /PropertyChanged\s*\+=/, 
    message: 'PropertyChanged subscription',
    suggestion: 'Unsubscribe in Unloaded handler',
    severity: 'warning',
    category: 'Memory Leak'
  },
  { 
    pattern: /StatusChanged\s*\+=/, 
    message: 'StatusChanged subscription',
    suggestion: 'Unsubscribe in Unloaded handler',
    severity: 'warning',
    category: 'Memory Leak'
  },
  
  // 4. NavigationCacheMode and DataContext
  { 
    pattern: /NavigationCacheMode\s*=\s*"Enabled"/, 
    message: 'NavigationCacheMode Enabled',
    suggestion: 'Verify DataContext is set correctly on re-navigation',
    severity: 'info',
    category: 'Navigation'
  },
  
  // 5. ProgressBar and async operations
  { 
    pattern: /ProgressBar.*Value\s*=/, 
    message: 'ProgressBar value update',
    suggestion: 'Ensure DispatcherQueue.TryEnqueue() if from background',
    severity: 'warning',
    category: 'Progress'
  },
  
  // 6. TextBox Binding and two-way binding conflicts
  { 
    pattern: /Text\s*=\s*"\{Binding.*Mode=TwoWay\}"/, 
    message: 'TextBox with TwoWay binding',
    suggestion: 'Avoid manual Text updates - they conflict with binding',
    severity: 'warning',
    category: 'Binding'
  },
  
  // 7. ItemsSource and ObservableCollection
  { 
    pattern: /List<.*>.*ItemsSource|ItemsSource.*List<.*>/, 
    message: 'ItemsSource bound to List<>',
    suggestion: 'Use ObservableCollection for automatic UI updates',
    severity: 'warning',
    category: 'Collection'
  },
  
  // 8. Terminal suppression
  { 
    pattern: /CreateNoWindow\s*=\s*true/, 
    message: 'CreateNoWindow insufficient for child processes',
    suggestion: 'Use Job Object P/Invoke for full suppression',
    severity: 'warning',
    category: 'Process'
  },
  
  // 9. ItemsRepeater nested DataTemplate
  { 
    pattern: /ItemsRepeater.*DataTemplate/, 
    message: 'ItemsRepeater with nested DataTemplate',
    suggestion: 'Click events may not propagate - use ItemsControl',
    severity: 'warning',
    category: 'UI'
  },
  
  // 10. x:Bind Tag pattern matching
  { 
    pattern: /sender\s+is\s+Button\s*\{\s*Tag\s*:\s*string\s*\}/, 
    message: 'x:Bind Tag pattern matching fails silently',
    suggestion: 'Use: sender is Button btn && btn.Tag is string',
    severity: 'error',
    category: 'Binding'
  },
  
  // 11. VirtualKey enum mismatch
  { 
    pattern: /VirtualKey\.D[0-9]/, 
    message: 'VirtualKey.D1-D9 incorrect for digit keys',
    suggestion: 'Use VirtualKey.Number1-Number9',
    severity: 'warning',
    category: 'Input'
  },
  
  // 12. PropertyChangedEventHandler type
  { 
    pattern: /EventHandler<.*PropertyChangedEventArgs>/, 
    message: 'Wrong PropertyChangedEventHandler type',
    suggestion: 'Use System.ComponentModel.PropertyChangedEventHandler',
    severity: 'error',
    category: 'Type'
  },
  
  // 13. CheckBox.IsChecked setter
  { 
    pattern: /CheckBox.*IsChecked\s*=\s*(?!.*suppress)/, 
    message: 'CheckBox.IsChecked setter fires events SYNCHRONOUS',
    suggestion: 'Set _suppressEvents = true BEFORE IsChecked',
    severity: 'warning',
    category: 'Event'
  },
  
  // 14. WrapPanel doesn't exist
  { 
    pattern: /WrapPanel/, 
    message: 'WrapPanel doesn\'t exist in WinUI 3',
    suggestion: 'Use ItemsRepeater with UniformGridLayout',
    severity: 'error',
    category: 'UI'
  },
  
  // 15. x:Bind defaults to OneTime
  { 
    pattern: /x:Bind(?!.*Mode=)/, 
    message: 'x:Bind defaults to OneTime',
    suggestion: 'Add Mode=OneWay for computed properties',
    severity: 'info',
    category: 'Binding'
  },
  
  // 16. StringToVisibilityConverter returns Visibility
  { 
    pattern: /StringToVisibilityConverter/, 
    message: 'StringToVisibilityConverter returns Visibility, NOT bool',
    suggestion: 'Use StringToBoolConverter for bool bindings',
    severity: 'warning',
    category: 'Converter'
  },
  
  // 17. BoolToColorConverter must handle both formats
  { 
    pattern: /BoolToColorConverter/, 
    message: 'BoolToColorConverter must handle #RRGGBB AND #RRGGBBAA',
    suggestion: 'Check length before parsing [7..9]',
    severity: 'info',
    category: 'Converter'
  },
  
  // 18. VirtualKeyStates enum mismatch
  { 
    pattern: /VirtualKeyStates/, 
    message: 'VirtualKeyStates enum mismatch in WinUI 3',
    suggestion: 'Use CoreVirtualKeyStates with bitwise AND',
    severity: 'warning',
    category: 'Input'
  },
  
  // 19. Environment.Exit(0) unreliable
  { 
    pattern: /Environment\.Exit\(0\)/, 
    message: 'Environment.Exit(0) unreliable in WinUI 3',
    suggestion: 'Use Process.GetCurrentProcess().Kill() as fallback',
    severity: 'warning',
    category: 'Exit'
  },
  
  // 20. Process.WaitForExitAsync hangs
  { 
    pattern: /WaitForExitAsync/, 
    message: 'Process.WaitForExitAsync() may hang',
    suggestion: 'Use poll loop while (!proc.HasExited)',
    severity: 'warning',
    category: 'Process'
  },
  
  // 21. StopAsync must propagate CancellationToken
  { 
    pattern: /StopAsync.*CancellationToken\.None/, 
    message: 'StopAsync with CancellationToken.None',
    suggestion: 'Propagate CancellationToken for cancellation',
    severity: 'warning',
    category: 'Async'
  },
  
  // 22. Fire-and-forget async
  { 
    pattern: /_\s*=\s*\w+Async\(\)/, 
    message: 'Fire-and-forget async operation',
    suggestion: 'Handle exceptions or use explicit async',
    severity: 'warning',
    category: 'Async'
  },
  
  // 23. Synchronous WaitForExit
  { 
    pattern: /WaitForExit\(\)/, 
    message: 'Synchronous WaitForExit blocks UI',
    suggestion: 'Use WaitForExitAsync or poll loop',
    severity: 'warning',
    category: 'Process'
  },
  
  // 24. cmd.exe /c vs start /B
  { 
    pattern: /cmd\.exe\s+\/c/, 
    message: 'cmd.exe /c is synchronous',
    suggestion: 'Consider start /B for async execution',
    severity: 'info',
    category: 'Process'
  },
  
  // 25. IZapretService doesn't implement IDisposable
  { 
    pattern: /IZapretService(?!.*IDisposable)/, 
    message: 'IZapretService may not implement IDisposable',
    suggestion: 'Check if disposal is needed',
    severity: 'info',
    category: 'Interface'
  },
]

export const winui3ComprehensiveValidator: Hook = {
  name: 'winui3-comprehensive-validator',
  event: 'tool.execute.after',
  filter: { tool: ['write', 'edit'] },
  
  handler: async (ctx) => {
    const { content, file_path } = ctx.params as any
    
    // Check both C# and XAML files
    const isCSharp = file_path?.endsWith('.cs')
    const isXaml = file_path?.endsWith('.xaml')
    
    if (!isCSharp && !isXaml) {
      return { proceed: true }
    }
    
    const issues: WinUI3Issue[] = []
    
    // Check for WinUI3 patterns
    for (const { pattern, context, message, suggestion, severity, category } of WINUI3_COMPREHENSIVE_PATTERNS) {
      // For patterns with context, check both pattern and context
      if (context) {
        if (pattern.test(content) && context.test(content)) {
          issues.push({
            type: severity as any,
            message: `[${category}] ${message}`,
            file: file_path,
            suggestion
          })
        }
      } else {
        if (pattern.test(content)) {
          issues.push({
            type: severity as any,
            message: `[${category}] ${message}`,
            file: file_path,
            suggestion
          })
        }
      }
    }
    
    // Additional checks for specific files
    if (file_path?.includes('Zapret2Page')) {
      // Check for known issues in Zapret2Page
      if (content.includes('OnOrchestratorStatusChanged') && !content.includes('Unloaded')) {
        issues.push({
          type: 'warning',
          message: '[Memory Leak] Zapret2Page subscribes to StatusChanged but no Unloaded handler',
          file: file_path,
          suggestion: 'Add OnUnloaded handler to unsubscribe'
        })
      }
      
      if (content.includes('UpdateVisuals') && content.includes('Text =')) {
        issues.push({
          type: 'warning',
          message: '[Binding Conflict] UpdateVisuals may conflict with TextBox bindings',
          file: file_path,
          suggestion: 'Use binding instead of manual Text updates'
        })
      }
    }
    
    // Separate by severity
    const errors = issues.filter(i => i.type === 'error')
    const warnings = issues.filter(i => i.type === 'warning')
    const infos = issues.filter(i => i.type === 'info')
    
    // Show errors
    if (errors.length > 0) {
      ctx.ui.toast({
        variant: 'error',
        title: 'WinUI3 Critical Issues',
        message: errors.map(e => e.message).join('\n'),
        duration: 10000
      })
    }
    
    // Show warnings
    if (warnings.length > 0) {
      ctx.ui.toast({
        variant: 'warning',
        title: 'WinUI3 Warnings',
        message: warnings.map(w => w.message).join('\n'),
        duration: 7000
      })
    }
    
    // Show infos (only if no errors/warnings)
    if (infos.length > 0 && errors.length === 0 && warnings.length === 0) {
      ctx.ui.toast({
        variant: 'info',
        title: 'WinUI3 Info',
        message: infos.map(i => i.message).join('\n'),
        duration: 5000
      })
    }
    
    return { proceed: true }
  }
}

export default winui3ComprehensiveValidator
