import type { Hook } from "@mimo-ai/plugin"

/**
 * Consolidated Error Validator Hook
 * 
 * Merges error-pattern-validator.ts and error-handling-validator.ts
 * Optimized for token efficiency.
 */

interface ValidationError {
  type: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
  file?: string
}

// Combined patterns (optimized)
const PATTERNS = {
  // Dangerous commands
  commands: [
    { p: /rm\s+-rf\s+\//, m: 'Recursive delete from root', s: 'error' },
    { p: /git\s+push\s+--force/, m: 'Force push detected', s: 'warning' },
    { p: /curl.*\|\s*sh/, m: 'Piping curl to shell', s: 'error' },
  ],
  
  // Error handling
  errorHandling: [
    { p: /catch\s*\{\s*\}/, m: 'Empty catch block', s: 'warning' },
    { p: /catch\s*\(\s*Exception/, m: 'Catching generic Exception', s: 'info' },
    { p: /HttpClient.*GetAsync(?!.*Timeout)/, m: 'HTTP without timeout', s: 'warning' },
  ],
  
  // Resources
  resources: [
    { p: /new\s+HttpClient\(\)/, m: 'HttpClient should be singleton', s: 'warning' },
    { p: /new\s+StreamReader/, m: 'StreamReader needs dispose', s: 'warning' },
  ],
  
  // Paths
  paths: [
    { p: /\\\\\\\\/, m: 'Double backslashes', s: 'error' },
    { p: /\s{2,}/, m: 'Multiple spaces in path', s: 'error' },
  ],
}

export const errorValidator: Hook = {
  name: 'error-validator',
  event: 'tool.execute.before',
  filter: { tool: ['bash', 'write', 'edit'] },
  
  handler: async (ctx) => {
    const { command, content, file_path } = ctx.params as any
    const issues: ValidationError[] = []
    
    // Check commands
    if (command) {
      for (const { p, m, s } of PATTERNS.commands) {
        if (p.test(command)) issues.push({ type: s as any, message: m })
      }
    }
    
    // Check content
    if (content) {
      // Error handling (C# only)
      if (file_path?.endsWith('.cs')) {
        for (const { p, m, s } of PATTERNS.errorHandling) {
          if (p.test(content)) issues.push({ type: s as any, message: m, file: file_path })
        }
      }
      
      // Resources
      for (const { p, m, s } of PATTERNS.resources) {
        if (p.test(content)) issues.push({ type: s as any, message: m, file: file_path })
      }
    }
    
    // Check paths
    if (file_path) {
      for (const { p, m, s } of PATTERNS.paths) {
        if (p.test(file_path)) issues.push({ type: s as any, message: m, file: file_path })
      }
    }
    
    // Handle results
    const errors = issues.filter(i => i.type === 'error')
    if (errors.length > 0) {
      ctx.ui.toast({ variant: 'error', title: 'Errors', message: errors.map(e => e.message).join('\n') })
      return { block: true }
    }
    
    const warnings = issues.filter(i => i.type === 'warning')
    if (warnings.length > 0) {
      ctx.ui.toast({ variant: 'warning', title: 'Warnings', message: warnings.map(w => w.message).join('\n') })
    }
    
    return { proceed: true }
  }
}

export default errorValidator
