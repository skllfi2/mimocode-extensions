import type { Hook } from "@mimo-ai/plugin"

/**
 * Component Integration Validator Hook
 * 
 * Validates component integration: DI chains, event handlers, DispatcherQueue.
 * Based on ZuiV2 audit issues with DI and event handler leaks.
 * 
 * Checks:
 * - DI registration completeness
 * - Event handler subscription/unsubscription
 * - DispatcherQueue usage for UI updates
 */

interface IntegrationIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  file?: string
  suggestion?: string
}

const INTEGRATION_PATTERNS = [
  // DI issues
  { 
    pattern: /new\s+\w+Service\(\)/, 
    message: 'Direct instantiation instead of DI',
    suggestion: 'Use dependency injection',
    severity: 'warning' 
  },
  { 
    pattern: /AddTransient<.*ViewModel>/, 
    message: 'Transient ViewModel loses state on navigation',
    suggestion: 'Use singleton for VMs with ongoing operations',
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
    pattern: /Loaded\s*\+=/, 
    message: 'Loaded event subscription without Unloaded',
    suggestion: 'Add Unloaded handler to unsubscribe',
    severity: 'info' 
  },
  
  // DispatcherQueue issues
  { 
    pattern: /DispatcherQueue.*Invoke\s*\(/, 
    message: 'Synchronous Invoke can cause deadlocks',
    suggestion: 'Use TryEnqueue or InvokeAsync',
    severity: 'warning' 
  },
  { 
    pattern: /await\s+DispatcherQueue/, 
    message: 'Awaiting DispatcherQueue can cause deadlocks',
    suggestion: 'Use TryEnqueue with callback',
    severity: 'warning' 
  },
  
  // Process issues
  { 
    pattern: /Process\.Start(?!Async)/, 
    message: 'Synchronous Process.Start',
    suggestion: 'Use Process.StartAsync or handle async',
    severity: 'info' 
  },
]

export const componentIntegrationValidator: Hook = {
  name: 'component-integration-validator',
  event: 'tool.execute.after',
  filter: { tool: ['write', 'edit'] },
  
  handler: async (ctx) => {
    const { content, file_path } = ctx.params as any
    
    // Only check C# files
    if (!file_path?.endsWith('.cs')) {
      return { proceed: true }
    }
    
    const issues: IntegrationIssue[] = []
    
    // Check for integration patterns
    for (const { pattern, message, suggestion, severity } of INTEGRATION_PATTERNS) {
      if (pattern.test(content)) {
        issues.push({
          type: severity as any,
          message,
          file: file_path,
          suggestion
        })
      }
    }
    
    // Check for missing DI registration
    if (content.includes('IProcessHost') && !content.includes('AddSingleton<IProcessHost')) {
      issues.push({
        type: 'warning',
        message: 'IProcessHost used but may not be registered',
        file: file_path,
        suggestion: 'Register in App.xaml.cs ConfigureServices()'
      })
    }
    
    // Check for missing IDisposable
    if (content.includes('new Process()') && !content.includes('using')) {
      issues.push({
        type: 'warning',
        message: 'Process without using statement',
        file: file_path,
        suggestion: 'Add using or implement IDisposable'
      })
    }
    
    // Show issues
    const warnings = issues.filter(i => i.type === 'warning')
    const infos = issues.filter(i => i.type === 'info')
    
    if (warnings.length > 0) {
      ctx.ui.toast({
        variant: 'warning',
        title: 'Integration Issues',
        message: warnings.map(w => w.message).join('\n'),
        duration: 7000
      })
    }
    
    if (infos.length > 0 && warnings.length === 0) {
      ctx.ui.toast({
        variant: 'info',
        title: 'Integration Info',
        message: infos.map(i => i.message).join('\n'),
        duration: 5000
      })
    }
    
    return { proceed: true }
  }
}

export default componentIntegrationValidator
