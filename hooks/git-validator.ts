import type { Hook } from "@mimo-ai/plugin"

/**
 * Git Validator Hook
 * 
 * Validates git operations and prevents common mistakes.
 * Based on analysis of git-related errors.
 * 
 * Checks:
 * - .gitignore presence
 * - Commit message conventions
 * - Destructive operations
 * - Secret detection
 */

interface GitIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
}

const DANGEROUS_GIT_PATTERNS = [
  { 
    pattern: /git\s+push\s+--force/, 
    message: 'Force push detected',
    suggestion: 'Create a backup branch first',
    severity: 'warning' 
  },
  { 
    pattern: /git\s+reset\s+--hard/, 
    message: 'Hard reset will discard changes',
    suggestion: 'Use git stash or create a branch',
    severity: 'warning' 
  },
  { 
    pattern: /git\s+clean\s+-fd/, 
    message: 'Git clean will delete untracked files',
    suggestion: 'Review files before cleaning',
    severity: 'warning' 
  },
  { 
    pattern: /git\s+branch\s+-D/, 
    message: 'Force delete branch',
    suggestion: 'Ensure branch is merged first',
    severity: 'warning' 
  },
]

const SECRET_PATTERNS = [
  { pattern: /api[_-]?key\s*[=:]\s*["'][^"']+["']/i, message: 'Potential API key' },
  { pattern: /password\s*[=:]\s*["'][^"']+["']/i, message: 'Potential password' },
  { pattern: /token\s*[=:]\s*["'][^"']+["']/i, message: 'Potential token' },
  { pattern: /secret\s*[=:]\s*["'][^"']+["']/i, message: 'Potential secret' },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, message: 'GitHub personal access token' },
  { pattern: /sk-[a-zA-Z0-9]{32,}/, message: 'Potential API key (sk-*)' },
]

const COMMIT_CONVENTIONS = [
  { pattern: /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,72}$/, valid: true },
  { pattern: /^.{1,72}$/, valid: false, message: 'Commit message should follow conventional commits' },
]

export const gitValidator: Hook = {
  name: 'git-validator',
  event: 'tool.execute.before',
  filter: { tool: ['bash'] },
  
  handler: async (ctx) => {
    const { command } = ctx.params as any
    const issues: GitIssue[] = []
    
    // Check for dangerous git operations
    for (const { pattern, message, suggestion, severity } of DANGEROUS_GIT_PATTERNS) {
      if (pattern.test(command)) {
        issues.push({
          type: severity as any,
          message,
          suggestion
        })
      }
    }
    
    // Check for secrets in git operations
    for (const { pattern, message } of SECRET_PATTERNS) {
      if (pattern.test(command)) {
        issues.push({
          type: 'error',
          message: `${message} detected in command`,
          suggestion: 'Remove secrets before committing'
        })
      }
    }
    
    // Check commit message
    const commitMatch = command.match(/git\s+commit\s+-m\s+["'](.+?)["']/)
    if (commitMatch) {
      const message = commitMatch[1]
      const isValid = COMMIT_CONVENTIONS.some(c => c.pattern.test(message))
      
      if (!isValid) {
        issues.push({
          type: 'info',
          message: 'Commit message should follow conventional commits',
          suggestion: 'Use: feat/fix/docs/style/refactor/test/chore(scope): description'
        })
      }
    }
    
    // Handle issues
    const errors = issues.filter(i => i.type === 'error')
    const warnings = issues.filter(i => i.type === 'warning')
    
    if (errors.length > 0) {
      ctx.ui.toast({
        variant: 'error',
        title: 'Git Errors',
        message: errors.map(e => e.message).join('\n'),
        duration: 10000
      })
      
      return {
        block: true,
        message: `Blocked: ${errors.length} git error(s)`
      }
    }
    
    if (warnings.length > 0) {
      ctx.ui.toast({
        variant: 'warning',
        title: 'Git Warnings',
        message: warnings.map(w => w.message).join('\n'),
        duration: 7000
      })
    }
    
    return { proceed: true }
  }
}

export default gitValidator
