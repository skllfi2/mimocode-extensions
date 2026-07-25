import type { Hook } from "@mimo-ai/plugin"

/**
 * UX Issues Validator Hook
 * 
 * Validates UX patterns: feedback, progress, confirmation.
 * Based on common UX issues in applications.
 * 
 * Checks:
 * - User feedback
 * - Progress indication
 * - Confirmation dialogs
 * - Error messages
 */

interface UXIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  file?: string
  suggestion?: string
}

const UX_PATTERNS = [
  // Feedback issues
  { 
    pattern: /Click.*(?:=>|{).*(?!Toast|Dialog|InfoBar)/, 
    message: 'Click handler without feedback',
    suggestion: 'Add Toast, Dialog, or InfoBar',
    severity: 'warning' 
  },
  { 
    pattern: /Button.*Click(?!.*Toast|.*Dialog)/, 
    message: 'Button click without user feedback',
    suggestion: 'Show progress or result',
    severity: 'info' 
  },
  
  // Progress issues
  { 
    pattern: /long\s+operation|download|upload/i, 
    message: 'Long operation without progress',
    suggestion: 'Add ProgressBar or loading indicator',
    severity: 'warning' 
  },
  { 
    pattern: /ProgressBar(?!.*IsIndeterminate)/, 
    message: 'ProgressBar without indeterminate mode',
    suggestion: 'Set IsIndeterminate for unknown duration',
    severity: 'info' 
  },
  
  // Confirmation issues
  { 
    pattern: /Delete|Remove|Clear/i, 
    message: 'Destructive action without confirmation',
    suggestion: 'Add ContentDialog confirmation',
    severity: 'warning' 
  },
  { 
    pattern: /File\.Delete|Directory\.Delete/, 
    message: 'File deletion without confirmation',
    suggestion: 'Add confirmation dialog',
    severity: 'warning' 
  },
  
  // Error message issues
  { 
    pattern: /catch.*(?:Exception|Error)/, 
    message: 'Exception caught without user message',
    suggestion: 'Show user-friendly error message',
    severity: 'info' 
  },
  { 
    pattern: /throw\s+new\s+Exception/, 
    message: 'Throwing generic Exception',
    suggestion: 'Use specific exception type',
    severity: 'info' 
  },
]

export const uxIssuesValidator: Hook = {
  name: 'ux-issues-validator',
  event: 'tool.execute.after',
  filter: { tool: ['write', 'edit'] },
  
  handler: async (ctx) => {
    const { content, file_path } = ctx.params as any
    
    // Only check C# and XAML files
    if (!file_path?.endsWith('.cs') && !file_path?.endsWith('.xaml')) {
      return { proceed: true }
    }
    
    const issues: UXIssue[] = []
    
    // Check for UX patterns
    for (const { pattern, message, suggestion, severity } of UX_PATTERNS) {
      if (pattern.test(content)) {
        issues.push({
          type: severity as any,
          message,
          file: file_path,
          suggestion
        })
      }
    }
    
    // Check for missing loading states
    if (content.includes('async') && content.includes('await') && !content.includes('Loading') && !content.includes('ProgressBar')) {
      issues.push({
        type: 'info',
        message: 'Async operation without loading state',
        file: file_path,
        suggestion: 'Consider adding loading indicator'
      })
    }
    
    // Show issues
    const warnings = issues.filter(i => i.type === 'warning')
    const infos = issues.filter(i => i.type === 'info')
    
    if (warnings.length > 0) {
      ctx.ui.toast({
        variant: 'warning',
        title: 'UX Issues',
        message: warnings.map(w => w.message).join('\n'),
        duration: 7000
      })
    }
    
    if (infos.length > 0 && warnings.length === 0) {
      ctx.ui.toast({
        variant: 'info',
        title: 'UX Info',
        message: infos.map(i => i.message).join('\n'),
        duration: 5000
      })
    }
    
    return { proceed: true }
  }
}

export default uxIssuesValidator
