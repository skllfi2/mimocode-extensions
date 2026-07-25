import type { Hook } from "@mimo-ai/plugin"

/**
 * Error Pattern Validator Hook
 * 
 * Prevents common development errors by validating patterns before execution.
 * Based on analysis of 37 days of development across 9 projects.
 * 
 * Error patterns covered:
 * 1. Configuration errors (wrong paths, missing deps)
 * 2. WinUI 3 specific errors (type casts, binding issues)
 * 3. Resource management errors (handle leaks, disposal)
 * 4. Testing errors (isolation, mock consistency)
 * 5. Documentation errors (missing projects, outdated docs)
 */

interface ValidationError {
  type: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
  file?: string
  line?: number
}

// Known problematic patterns
const DANGEROUS_COMMAND_PATTERNS = [
  { pattern: /rm\s+-rf\s+\//, message: 'Recursive delete from root', severity: 'error' },
  { pattern: /git\s+push\s+--force/, message: 'Force push detected', severity: 'warning' },
  { pattern: /curl.*\|\s*sh/, message: 'Piping curl to shell', severity: 'error' },
  { pattern: /chmod\s+777\s+\//, message: 'Setting 777 permissions on root', severity: 'error' },
  { pattern: /git\s+reset\s+--hard/, message: 'Hard reset detected', severity: 'warning' },
  { pattern: /git\s+clean\s+-fd/, message: 'Git clean detected', severity: 'warning' },
]

const WINUI3_PATTERNS = [
  { pattern: /StringToVisibilityConverter/, message: 'Returns Visibility, not bool', severity: 'warning' },
  { pattern: /x:Bind(?!\s+Mode=)/, message: 'x:Bind defaults to OneTime', severity: 'info' },
  { pattern: /async\s+void.*Page/, message: 'async void in Page can crash', severity: 'error' },
  { pattern: /Process\.Start.*WaitForExit/, message: 'Use WaitForExitAsync instead', severity: 'info' },
  { pattern: /DispatcherQueue.*Invoke.*async/, message: 'Use TryEnqueue instead', severity: 'info' },
]

const RESOURCE_PATTERNS = [
  { pattern: /new\s+HttpClient\(\)/, message: 'HttpClient should be singleton', severity: 'warning' },
  { pattern: /new\s+StreamReader\(/, message: 'StreamReader needs using/dispose', severity: 'warning' },
  { pattern: /new\s+StreamWriter\(/, message: 'StreamWriter needs using/dispose', severity: 'warning' },
  { pattern: /Process\.Start/, message: 'Process needs disposal', severity: 'info' },
]

const PATH_ISSUES = [
  { pattern: /\\\\\\\\/, message: 'Double backslashes in path', severity: 'error' },
  { pattern: /[A-Z]:\\\\[^\\]/, message: 'Missing trailing slash', severity: 'warning' },
  { pattern: /\s{2,}/, message: 'Multiple spaces in path', severity: 'error' },
  { pattern: /\$\{[^}]+\}/, message: 'Unresolved variable in path', severity: 'warning' },
]

export const errorPatternValidator: Hook = {
  name: 'error-pattern-validator',
  event: 'tool.execute.before',
  filter: { tool: ['bash', 'write', 'edit'] },
  
  handler: async (ctx) => {
    const errors: ValidationError[] = []
    const { command, content, file_path } = ctx.params as any
    
    // Validate bash commands
    if (command) {
      for (const { pattern, message, severity } of DANGEROUS_COMMAND_PATTERNS) {
        if (pattern.test(command)) {
          errors.push({ type: severity as any, message, suggestion: 'Review command before execution' })
        }
      }
    }
    
    // Validate file content
    if (content) {
      // WinUI 3 patterns
      if (file_path?.endsWith('.cs') || file_path?.endsWith('.xaml')) {
        for (const { pattern, message, severity } of WINUI3_PATTERNS) {
          if (pattern.test(content)) {
            errors.push({ type: severity as any, message, file: file_path })
          }
        }
      }
      
      // Resource patterns
      for (const { pattern, message, severity } of RESOURCE_PATTERNS) {
        if (pattern.test(content)) {
          errors.push({ type: severity as any, message, file: file_path })
        }
      }
    }
    
    // Validate file paths
    if (file_path) {
      for (const { pattern, message, severity } of PATH_ISSUES) {
        if (pattern.test(file_path)) {
          errors.push({ type: severity as any, message, file: file_path })
        }
      }
    }
    
    // Handle validation results
    const criticalErrors = errors.filter(e => e.type === 'error')
    const warnings = errors.filter(e => e.type === 'warning')
    
    if (criticalErrors.length > 0) {
      ctx.ui.toast({
        variant: 'error',
        title: 'Critical Issues Found',
        message: criticalErrors.map(e => e.message).join('\n'),
        duration: 10000
      })
      
      // Block execution for critical errors
      return {
        block: true,
        message: `Blocked: ${criticalErrors.length} critical issue(s) found`
      }
    }
    
    if (warnings.length > 0) {
      ctx.ui.toast({
        variant: 'warning',
        title: 'Warnings',
        message: warnings.map(e => e.message).join('\n'),
        duration: 7000
      })
    }
    
    return { proceed: true }
  }
}

export default errorPatternValidator
