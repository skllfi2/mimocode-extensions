import type { Hook } from "@mimo-ai/plugin"
import { readFileSync, existsSync, readdirSync, statSync } from "fs"
import { join } from "path"

/**
 * Consolidated Config Validator Hook
 * 
 * Merges config-validator.ts and runtime-state-validator.ts
 * Optimized for token efficiency.
 * 
 * Based on ZuiV2 runtime issues:
 * - Version shows "—" because settings are null
 * - Lua files empty (mod_lua/ empty, lua/ has files)
 * - Lists empty (only comments in files)
 * - Toggle mode UX not documented
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
    { p: /"?\w+"?\s*:\s*""/, m: 'Setting is empty string', s: 'warning' },
  ],
}

// Empty file patterns
const EMPTY_FILE_PATTERNS = [
  /^\s*$/,
  /^#/,
  /^\/\/.*$/,
  /^\/\*.*\*\//,
]

function isEmptyOrCommentOnly(content: string): boolean {
  const trimmed = content.trim()
  if (trimmed.length === 0) return true
  return EMPTY_FILE_PATTERNS.some(p => p.test(trimmed))
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
      
      // Check for null/empty values in JSON
      try {
        const json = JSON.parse(content)
        for (const [key, value] of Object.entries(json)) {
          if (value === null || value === undefined) {
            issues.push({ type: 'warning', message: `Setting "${key}" is null/undefined`, file: file_path })
          }
          if (value === "" || value === "—") {
            issues.push({ type: 'info', message: `Setting "${key}" is placeholder`, file: file_path })
          }
        }
      } catch (e) {
        // JSON parse error - already handled
      }
    }
    
    // Check file contents
    if (content && file_path) {
      if (isEmptyOrCommentOnly(content)) {
        issues.push({ type: 'warning', message: `File is empty or only comments: ${file_path}` })
      }
    }
    
    // Check runtime state
    if (file_path && existsSync(file_path) && statSync(file_path).isDirectory()) {
      const files = readdirSync(file_path)
      if (files.length === 0) {
        issues.push({ type: 'warning', message: `Empty directory: ${file_path}` })
      } else {
        // Check for empty files in directory
        for (const file of files) {
          const filePath = join(file_path, file)
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            try {
              const fileContent = readFileSync(filePath, 'utf-8')
              if (isEmptyOrCommentOnly(fileContent)) {
                issues.push({ type: 'warning', message: `Empty file: ${filePath}` })
              }
            } catch (e) {
              // Skip files that can't be read
            }
          }
        }
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
