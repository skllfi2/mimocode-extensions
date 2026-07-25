import type { Hook } from "@mimo-ai/plugin"

/**
 * WinUI3 Comprehensive Validator Hook
 * 
 * Validates all WinUI3-specific patterns based on real issues found in ZuiV2.
 * 
 * Issues covered:
 * 1. UI Thread Access - accessing UI from background thread
 * 2. StaticResource vs ThemeResource - theme updates
 * 3. Unloaded Event and leaks - event subscription leaks
 * 4. NavigationCacheMode and DataContext
 * 5. ProgressBar and async operations
 * 6. TextBox Binding and two-way binding conflicts
 * 7. ItemsSource and ObservableCollection
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
  { 
    pattern: /\{StaticResource\s+\w+Brush\}/g, 
    message: 'Multiple StaticResource brushes detected',
    suggestion: 'Review if theme updates are needed',
    severity: 'info',
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
  { 
    pattern: /LoadState|OnNavigatedTo/, 
    message: 'Navigation event handler',
    suggestion: 'Check if state is restored correctly',
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
  { 
    pattern: /IsIndeterminate\s*=\s*true/, 
    message: 'Indeterminate ProgressBar',
    suggestion: 'Set to false when operation completes',
    severity: 'info',
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
  { 
    pattern: /\.Text\s*=.* TextBox/, 
    message: 'Manual TextBox.Text update',
    suggestion: 'Use binding instead of manual updates',
    severity: 'warning',
    category: 'Binding'
  },
  
  // 7. ItemsSource and ObservableCollection
  { 
    pattern: /ItemsSource\s*=\s*"\{Binding\s+\w+\}"/, 
    message: 'ItemsSource binding',
    suggestion: 'Ensure bound property is ObservableCollection for live updates',
    severity: 'info',
    category: 'Collection'
  },
  { 
    pattern: /List<.*>.*ItemsSource|ItemsSource.*List<.*>/, 
    message: 'ItemsSource bound to List<>',
    suggestion: 'Use ObservableCollection for automatic UI updates',
    severity: 'warning',
    category: 'Collection'
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
