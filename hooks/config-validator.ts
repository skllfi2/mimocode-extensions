import type { Hook } from "@mimo-ai/plugin"
import { readFileSync, existsSync, readdirSync, statSync } from "fs"
import { join } from "path"

/**
 * Consolidated Config Validator Hook
 * 
 * Merges config-validator.ts and runtime-state-validator.ts
 * Optimized for token efficiency.
 */

interface ConfigIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  file?: string
}

// Cache for validation results
const validationCache = new Map<string, { issues: ConfigIssue[]; timestamp: number }>()
const CACHE_TTL = 60000

// Combined patterns
const PATTERNS = {
  paths: [
    { p: /\\\\\\\\/, m: 'Double backslashes', s: 'error' },
    { p: /\s{2,}/, m: 'Multiple spaces in path', s: 'error' },
  ],
  settings: [
    { p: /"?\w+"?\s*:\s*null/, m: 'Setting is null', s: 'warning' },
    { p: /"?\w+"?\s*:\s*"—"/, m: 'Setting is placeholder', s: 'info' },
  ],
}

export const configValidator: Hook = {
  name: 'config-validator',
  event: 'tool.execute.before',
  filter: { tool: ['bash', 'write', 'edit'] },
  
  handler: async (ctx) => {
    const { command, content, file_path } = ctx.params as any
    const issues: ConfigIssue[] = []
    
    // Check paths
    if (file_path) {
      for (const { p, m, s } of PATTERNS.paths) {
        if (p.test(file_path)) issues.push({ type: s as any, message: m, file: file_path })
      }
    }
    
    // Check JSON config
    if (content && (file_path?.endsWith('.json') || file_path?.endsWith('.jsonc'))) {
      for (const { p, m, s } of PATTERNS.settings) {
        if (p.test(content)) issues.push({ type: s as any, message: m, file: file_path })
      }
    }
    
    // Check runtime state
    if (file_path && existsSync(file_path) && statSync(file_path).isDirectory()) {
      const files = readdirSync(file_path)
      if (files.length === 0) {
        issues.push({ type: 'warning', message: `Empty directory: ${file_path}` })
      }
    }
    
    // Handle results
    const errors = issues.filter(i => i.type === 'error')
    if (errors.length > 0) {
      ctx.ui.toast({ variant: 'error', title: 'Config Errors', message: errors.map(e => e.message).join('\n') })
      return { block: true }
    }
    
    const warnings = issues.filter(i => i.type === 'warning')
    if (warnings.length > 0) {
      ctx.ui.toast({ variant: 'warning', title: 'Config Warnings', message: warnings.map(w => w.message).join('\n') })
    }
    
    return { proceed: true }
  }
}

export default configValidator
