import type { Hook } from "@mimo-ai/plugin"

/**
 * Performance Validator Hook
 * 
 * Validates performance patterns: blocking UI, memory issues, async patterns.
 * Based on common performance problems in WinUI 3 applications.
 * 
 * Checks:
 * - Blocking UI patterns
 * - Memory leaks
 * - Async/sync mismatches
 * - Long-running operations
 */

interface PerformanceIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  file?: string
  suggestion?: string
}

const PERFORMANCE_PATTERNS = [
  // Blocking UI issues
  { 
    pattern: /Task\.Delay\(\d{4,}\)/, 
    message: 'Long Task.Delay may block UI',
    suggestion: 'Use shorter delays with cancellation',
    severity: 'warning' 
  },
  { 
    pattern: /\.Result\b/, 
    message: 'Synchronous .Result blocks UI thread',
    suggestion: 'Use await instead',
    severity: 'error' 
  },
  { 
    pattern: /\.Wait\(\)/, 
    message: 'Synchronous .Wait() blocks UI thread',
    suggestion: 'Use await instead',
    severity: 'error' 
  },
  { 
    pattern: /Thread\.Sleep/, 
    message: 'Thread.Sleep blocks UI thread',
    suggestion: 'Use Task.Delay with cancellation',
    severity: 'error' 
  },
  
  // Memory issues
  { 
    pattern: /new\s+byte\[.*\d{7,}.*\]/, 
    message: 'Large byte array allocation',
    suggestion: 'Consider streaming or chunking',
    severity: 'warning' 
  },
  { 
    pattern: /MemoryStream.*ToArray/, 
    message: 'MemoryStream.ToArray() creates copy',
    suggestion: 'Use GetBuffer() if possible',
    severity: 'info' 
  },
  
  // Async issues
  { 
    pattern: /async\s+void(?!\s+(Page|Window))/, 
    message: 'async void outside Page/Window',
    suggestion: 'Use async Task to catch exceptions',
    severity: 'warning' 
  },
  { 
    pattern: /GetAwaiter\(\)\.GetResult/, 
    message: 'GetAwaiter().GetResult() blocks',
    suggestion: 'Use await instead',
    severity: 'error' 
  },
  
  // Collection issues
  { 
    pattern: /List<.*>\.ForEach/, 
    message: 'ForEach on large list',
    suggestion: 'Consider parallel processing',
    severity: 'info' 
  },
  { 
    pattern: /new\s+List<.*>\(\).*\n.*\.Add/, 
    message: 'List initialization without capacity',
    suggestion: 'Pre-allocate capacity if known',
    severity: 'info' 
  },
]

export const performanceValidator: Hook = {
  name: 'performance-validator',
  event: 'tool.execute.after',
  filter: { tool: ['write', 'edit'] },
  
  handler: async (ctx) => {
    const { content, file_path } = ctx.params as any
    
    // Only check C# files
    if (!file_path?.endsWith('.cs')) {
      return { proceed: true }
    }
    
    const issues: PerformanceIssue[] = []
    
    // Check for performance patterns
    for (const { pattern, message, suggestion, severity } of PERFORMANCE_PATTERNS) {
      if (pattern.test(content)) {
        issues.push({
          type: severity as any,
          message,
          file: file_path,
          suggestion
        })
      }
    }
    
    // Check for potential deadlocks
    if (content.includes('SemaphoreSlim') && content.Contains('Wait(')) {
      issues.push({
        type: 'warning',
        message: 'SemaphoreSlim.Wait() may cause deadlock',
        file: file_path,
        suggestion: 'Use WaitAsync() instead'
      })
    }
    
    // Show issues
    const errors = issues.filter(i => i.type === 'error')
    const warnings = issues.filter(i => i.type === 'warning')
    
    if (errors.length > 0) {
      ctx.ui.toast({
        variant: 'error',
        title: 'Performance Errors',
        message: errors.map(e => e.message).join('\n'),
        duration: 10000
      })
    }
    
    if (warnings.length > 0) {
      ctx.ui.toast({
        variant: 'warning',
        title: 'Performance Warnings',
        message: warnings.map(w => w.message).join('\n'),
        duration: 7000
      })
    }
    
    return { proceed: true }
  }
}

export default performanceValidator
