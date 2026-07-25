import type { Hook } from "@mimo-ai/plugin"

/**
 * Error Handling Validator Hook
 * 
 * Validates error handling patterns: silent failures, timeouts, retry logic.
 * Based on common error handling issues in applications.
 * 
 * Checks:
 * - Silent failures (empty catch blocks)
 * - Missing timeouts
 * - Missing retry logic
 * - Proper exception propagation
 */

interface ErrorHandlingIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  file?: string
  suggestion?: string
}

const ERROR_HANDLING_PATTERNS = [
  // Silent failures
  { 
    pattern: /catch\s*\(\s*\w*\s*\)\s*\{\s*\}/, 
    message: 'Empty catch block swallows exception',
    suggestion: 'Log exception or rethrow',
    severity: 'warning' 
  },
  { 
    pattern: /catch\s*\(\s*Exception\s*\)\s*\{/, 
    message: 'Catching generic Exception',
    suggestion: 'Catch specific exceptions',
    severity: 'info' 
  },
  { 
    pattern: /catch\s*\{/, 
    message: 'Catching all exceptions',
    suggestion: 'Catch specific exceptions',
    severity: 'warning' 
  },
  
  // Timeout issues
  { 
    pattern: /HttpClient.*GetAsync(?!.*Timeout)/, 
    message: 'HTTP request without timeout',
    suggestion: 'Add CancellationToken with timeout',
    severity: 'warning' 
  },
  { 
    pattern: /WebClient.*Download/, 
    message: 'WebClient download without timeout',
    suggestion: 'Use HttpClient with timeout',
    severity: 'warning' 
  },
  
  // Retry issues
  { 
    pattern: /HttpRequestException/, 
    message: 'HTTP exception without retry',
    suggestion: 'Implement retry with Polly or similar',
    severity: 'info' 
  },
  { 
    pattern: /SocketException/, 
    message: 'Socket exception without retry',
    suggestion: 'Implement retry with backoff',
    severity: 'info' 
  },
  
  // Exception propagation
  { 
    pattern: /throw\s*;/, 
    message: 'Rethrow with throw;',
    suggestion: 'Consider preserving stack trace',
    severity: 'info' 
  },
  { 
    pattern: /Task\.Run.*catch/, 
    message: 'Task.Run with catch',
    suggestion: 'Ensure exceptions propagate correctly',
    severity: 'info' 
  },
]

export const errorHandlingValidator: Hook = {
  name: 'error-handling-validator',
  event: 'tool.execute.after',
  filter: { tool: ['write', 'edit'] },
  
  handler: async (ctx) => {
    const { content, file_path } = ctx.params as any
    
    // Only check C# files
    if (!file_path?.endsWith('.cs')) {
      return { proceed: true }
    }
    
    const issues: ErrorHandlingIssue[] = []
    
    // Check for error handling patterns
    for (const { pattern, message, suggestion, severity } of ERROR_HANDLING_PATTERNS) {
      if (pattern.test(content)) {
        issues.push({
          type: severity as any,
          message,
          file: file_path,
          suggestion
        })
      }
    }
    
    // Check for missing exception logging
    if (content.includes('catch') && !content.includes('Log') && !content.includes('_log')) {
      issues.push({
        type: 'info',
        message: 'Catch block without logging',
        file: file_path,
        suggestion: 'Add logging for debugging'
      })
    }
    
    // Show issues
    const warnings = issues.filter(i => i.type === 'warning')
    const infos = issues.filter(i => i.type === 'info')
    
    if (warnings.length > 0) {
      ctx.ui.toast({
        variant: 'warning',
        title: 'Error Handling Issues',
        message: warnings.map(w => w.message).join('\n'),
        duration: 7000
      })
    }
    
    if (infos.length > 0 && warnings.length === 0) {
      ctx.ui.toast({
        variant: 'info',
        title: 'Error Handling Info',
        message: infos.map(i => i.message).join('\n'),
        duration: 5000
      })
    }
    
    return { proceed: true }
  }
}

export default errorHandlingValidator
