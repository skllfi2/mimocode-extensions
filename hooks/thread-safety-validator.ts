import type { Hook } from "@mimo-ai/plugin"

/**
 * Thread Safety Validator Hook
 * 
 * Validates thread safety patterns: concurrent access, race conditions.
 * Based on common threading issues in applications.
 * 
 * Checks:
 * - Concurrent collection access
 * - Race conditions
 * - Lock usage
 * - Thread-safe patterns
 */

interface ThreadSafetyIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  file?: string
  suggestion?: string
}

const THREAD_SAFETY_PATTERNS = [
  // Concurrent access issues
  { 
    pattern: /List<.*>\.Add/, 
    message: 'List.Add may not be thread-safe',
    suggestion: 'Use ConcurrentBag or lock',
    severity: 'warning' 
  },
  { 
    pattern: /Dictionary<.*>\.Add/, 
    message: 'Dictionary.Add may not be thread-safe',
    suggestion: 'Use ConcurrentDictionary',
    severity: 'warning' 
  },
  { 
    pattern: /new\s+List<.*>\(\)(?!\s*;)/, 
    message: 'List shared across threads',
    suggestion: 'Use ConcurrentBag or lock access',
    severity: 'info' 
  },
  
  // Race condition issues
  { 
    pattern: /if\s*\(.*==.*null\).*\n.*=.*new/, 
    message: 'Potential race condition in null check',
    suggestion: 'Use lock or Interlocked.CompareExchange',
    severity: 'warning' 
  },
  { 
    pattern: /\+\+|\-\-/, 
    message: 'Increment/decrement may not be atomic',
    suggestion: 'Use Interlocked.Increment/Decrement',
    severity: 'info' 
  },
  
  // Lock issues
  { 
    pattern: /lock\s*\(/, 
    message: 'Lock detected',
    suggestion: 'Ensure consistent lock ordering',
    severity: 'info' 
  },
  { 
    pattern: /Monitor\.Enter/, 
    message: 'Monitor.Enter without try/finally',
    suggestion: 'Use lock statement or try/finally',
    severity: 'warning' 
  },
  
  // Async thread issues
  { 
    pattern: /Task\.Run.*\{/, 
    message: 'Task.Run captures current thread',
    suggestion: 'Be aware of thread context',
    severity: 'info' 
  },
  { 
    pattern: /ThreadPool/, 
    message: 'Direct ThreadPool usage',
    suggestion: 'Use Task.Run instead',
    severity: 'info' 
  },
]

export const threadSafetyValidator: Hook = {
  name: 'thread-safety-validator',
  event: 'tool.execute.after',
  filter: { tool: ['write', 'edit'] },
  
  handler: async (ctx) => {
    const { content, file_path } = ctx.params as any
    
    // Only check C# files
    if (!file_path?.endsWith('.cs')) {
      return { proceed: true }
    }
    
    const issues: ThreadSafetyIssue[] = []
    
    // Check for thread safety patterns
    for (const { pattern, message, suggestion, severity } of THREAD_SAFETY_PATTERNS) {
      if (pattern.test(content)) {
        issues.push({
          type: severity as any,
          message,
          file: file_path,
          suggestion
        })
      }
    }
    
    // Check for ConcurrentDictionary usage
    if (content.includes('ConcurrentDictionary')) {
      // Good pattern - no issue
    } else if (content.includes('Dictionary<') && content.includes('Add(')) {
      issues.push({
        type: 'warning',
        message: 'Dictionary used without thread safety',
        file: file_path,
        suggestion: 'Consider ConcurrentDictionary'
      })
    }
    
    // Show issues
    const warnings = issues.filter(i => i.type === 'warning')
    const infos = issues.filter(i => i.type === 'info')
    
    if (warnings.length > 0) {
      ctx.ui.toast({
        variant: 'warning',
        title: 'Thread Safety Issues',
        message: warnings.map(w => w.message).join('\n'),
        duration: 7000
      })
    }
    
    if (infos.length > 0 && warnings.length === 0) {
      ctx.ui.toast({
        variant: 'info',
        title: 'Thread Safety Info',
        message: infos.map(i => i.message).join('\n'),
        duration: 5000
      })
    }
    
    return { proceed: true }
  }
}

export default threadSafetyValidator
