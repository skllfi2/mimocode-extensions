import type { Hook } from "@mimo-ai/plugin"

/**
 * WinUI 3 Validator Hook
 * 
 * Validates WinUI 3 specific patterns and prevents common errors.
 * Based on analysis of 37 days of WinUI 3 development.
 * 
 * Checks:
 * - Type cast safety
 * - Data binding correctness
 * - Process lifecycle management
 * - Event handler cleanup
 */

interface WinUIIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
  line?: number
}

const WINUI3_PATTERNS = [
  // Type safety issues
  { 
    pattern: /Assert\.Equal<.*>\(.*Brush/, 
    message: 'Cannot test SolidColorBrush in unit tests',
    suggestion: 'Test via hex color string comparison',
    severity: 'warning' 
  },
  { 
    pattern: /DependencyProperty\.UnsetValue/, 
    message: 'UnsetValue is not reference-equal',
    suggestion: 'Use Assert.IsType() or verify non-null',
    severity: 'warning' 
  },
  
  // Data binding issues
  { 
    pattern: /x:Bind(?!\s+Mode=)/, 
    message: 'x:Bind defaults to OneTime',
    suggestion: 'Add Mode=OneWay if property changes',
    severity: 'info' 
  },
  { 
    pattern: /StringToVisibilityConverter/, 
    message: 'Returns Visibility, not bool',
    suggestion: 'Use StringToBoolConverter for bool bindings',
    severity: 'warning' 
  },
  { 
    pattern: /BoolToColorConverter/, 
    message: 'Must handle #RRGGBB AND #RRGGBBAA',
    suggestion: 'Check length before parsing',
    severity: 'info' 
  },
  
  // Process management issues
  { 
    pattern: /async\s+void.*Page/, 
    message: 'async void in Page can cause crashes',
    suggestion: 'Use async Task initialization pattern',
    severity: 'error' 
  },
  { 
    pattern: /Process\.Start.*WaitForExit\(\)/, 
    message: 'Synchronous WaitForExit blocks UI',
    suggestion: 'Use WaitForExitAsync instead',
    severity: 'warning' 
  },
  { 
    pattern: /CreateNoWindow\s*=\s*true/, 
    message: 'Insufficient for child processes',
    suggestion: 'Use Job Object P/Invoke for full suppression',
    severity: 'warning' 
  },
  
  // Event handler issues
  { 
    pattern: /PropertyChanged\s*\+=/, 
    message: 'PropertyChanged subscription without unsubscribe',
    suggestion: 'Unsubscribe in Unloaded handler',
    severity: 'warning' 
  },
  { 
    pattern: /VirtualKey\.D[0-9]/, 
    message: 'VirtualKey.D1-D9 incorrect for digit keys',
    suggestion: 'Use VirtualKey.Number1-Number9',
    severity: 'warning' 
  },
  
  // Dispatcher issues
  { 
    pattern: /DispatcherQueue.*Invoke.*async/, 
    message: 'InvokeAsync can cause deadlocks',
    suggestion: 'Use TryEnqueue instead',
    severity: 'warning' 
  },
  
  // Window issues
  { 
    pattern: /AppWindow\.Move.*Constructor/, 
    message: 'Move in constructor causes invisible window',
    suggestion: 'Call after MainWindow.Activate()',
    severity: 'error' 
  },
]

export const winuiValidator: Hook = {
  name: 'winui-validator',
  event: 'tool.execute.after',
  filter: { tool: ['write', 'edit'] },
  
  handler: async (ctx) => {
    const { content, file_path } = ctx.params as any
    
    // Only check C# and XAML files
    if (!file_path?.endsWith('.cs') && !file_path?.endsWith('.xaml')) {
      return { proceed: true }
    }
    
    const issues: WinUIIssue[] = []
    
    // Check for WinUI 3 patterns
    for (const { pattern, message, suggestion, severity } of WINUI3_PATTERNS) {
      if (pattern.test(content)) {
        issues.push({
          type: severity as any,
          message,
          suggestion
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
        title: 'WinUI 3 Errors',
        message: errors.map(e => e.message).join('\n'),
        duration: 10000
      })
    }
    
    // Show warnings
    if (warnings.length > 0) {
      ctx.ui.toast({
        variant: 'warning',
        title: 'WinUI 3 Warnings',
        message: warnings.map(w => w.message).join('\n'),
        duration: 7000
      })
    }
    
    // Show infos (only if no errors/warnings)
    if (infos.length > 0 && errors.length === 0 && warnings.length === 0) {
      ctx.ui.toast({
        variant: 'info',
        title: 'WinUI 3 Tips',
        message: infos.map(i => i.message).join('\n'),
        duration: 5000
      })
    }
    
    return { proceed: true }
  }
}

export default winuiValidator
