import type { Hook } from "@mimo-ai/plugin"

/**
 * Platform Issues Validator Hook
 * 
 * Validates platform-specific issues: WinDivert, paths, antivirus.
 * Based on common platform issues in Windows applications.
 * 
 * Checks:
 * - WinDivert requirements
 * - Path issues (spaces, cyrillic)
 * - Antivirus conflicts
 * - Permission issues
 */

interface PlatformIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  file?: string
  suggestion?: string
}

const PLATFORM_PATTERNS = [
  // WinDivert issues
  { 
    pattern: /WinDivert/, 
    message: 'WinDivert requires admin + driver signature',
    suggestion: 'Ensure running as admin and driver is signed',
    severity: 'warning' 
  },
  { 
    pattern: /winws\.exe/, 
    message: 'winws.exe requires admin privileges',
    suggestion: 'Run as administrator',
    severity: 'warning' 
  },
  
  // Path issues
  { 
    pattern: /C:\\Program Files/, 
    message: 'Path may have spaces',
    suggestion: 'Use quotes or short path',
    severity: 'info' 
  },
  { 
    pattern: /[а-яА-Я]/, 
    message: 'Cyrillic characters in path',
    suggestion: 'Use ASCII-only paths',
    severity: 'warning' 
  },
  { 
    pattern: /\\[^\\]*\\[^\\]*\\/, 
    message: 'Deep path nesting',
    suggestion: 'Consider shorter paths',
    severity: 'info' 
  },
  
  // Permission issues
  { 
    pattern: /File\.WriteAll/, 
    message: 'File write may require permissions',
    suggestion: 'Check file permissions',
    severity: 'info' 
  },
  { 
    pattern: /Registry/, 
    message: 'Registry access may require admin',
    suggestion: 'Run as administrator',
    severity: 'warning' 
  },
  
  // Antivirus issues
  { 
    pattern: /\.dll/, 
    message: 'DLL may be blocked by antivirus',
    suggestion: 'Add exception or sign DLL',
    severity: 'info' 
  },
  { 
    pattern: /\.exe/, 
    message: 'EXE may be blocked by antivirus',
    suggestion: 'Add exception or sign EXE',
    severity: 'info' 
  },
]

export const platformIssuesValidator: Hook = {
  name: 'platform-issues-validator',
  event: 'tool.execute.after',
  filter: { tool: ['write', 'edit'] },
  
  handler: async (ctx) => {
    const { content, file_path } = ctx.params as any
    
    const issues: PlatformIssue[] = []
    
    // Check for platform patterns
    for (const { pattern, message, suggestion, severity } of PLATFORM_PATTERNS) {
      if (pattern.test(content)) {
        issues.push({
          type: severity as any,
          message,
          file: file_path,
          suggestion
        })
      }
    }
    
    // Check for hardcoded paths
    if (content.includes('C:\\') && !content.includes('Path.Combine')) {
      issues.push({
        type: 'warning',
        message: 'Hardcoded path detected',
        file: file_path,
        suggestion: 'Use Path.Combine or configuration'
      })
    }
    
    // Show issues
    const warnings = issues.filter(i => i.type === 'warning')
    const infos = issues.filter(i => i.type === 'info')
    
    if (warnings.length > 0) {
      ctx.ui.toast({
        variant: 'warning',
        title: 'Platform Issues',
        message: warnings.map(w => w.message).join('\n'),
        duration: 7000
      })
    }
    
    if (infos.length > 0 && warnings.length === 0) {
      ctx.ui.toast({
        variant: 'info',
        title: 'Platform Info',
        message: infos.map(i => i.message).join('\n'),
        duration: 5000
      })
    }
    
    return { proceed: true }
  }
}

export default platformIssuesValidator
