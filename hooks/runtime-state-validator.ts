import type { Hook } from "@mimo-ai/plugin"
import { readFileSync, existsSync, readdirSync, statSync } from "fs"
import { join } from "path"

/**
 * Runtime State Validator Hook
 * 
 * Validates runtime state: file contents, settings values, directory contents.
 * Based on ZuiV2 audit issues where code was correct but runtime state was broken.
 * 
 * Checks:
 * - File contents (not just existence)
 * - Settings values (not just code structure)
 * - Directory contents (not just existence)
 * - Empty files and directories
 * - Null/default values in settings
 */

interface RuntimeIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  path?: string
  suggestion?: string
}

// Patterns that indicate potential runtime issues
const EMPTY_FILE_PATTERNS = [
  { pattern: /^\s*$/, message: 'File is empty' },
  { pattern: /^#/, message: 'File contains only comments' },
  { pattern: /^\/\/.*$/, message: 'File contains only comments' },
]

const NULL_SETTINGS_PATTERNS = [
  { pattern: /"?\w+"?\s*:\s*null/, message: 'Setting is null' },
  { pattern: /"?\w+"?\s*:\s*"", message: 'Setting is empty string' },
  { pattern: /"?\w+"?\s*:\s*"—"/, message: 'Setting is placeholder "—"' },
  { pattern: /"?\w+"?\s*:\s*0/, message: 'Setting is zero' },
]

export const runtimeStateValidator: Hook = {
  name: 'runtime-state-validator',
  event: 'tool.execute.after',
  filter: { tool: ['read', 'write', 'edit'] },
  
  handler: async (ctx) => {
    const { file_path, content } = ctx.params as any
    const issues: RuntimeIssue[] = []
    
    if (!file_path) return { proceed: true }
    
    // Check file contents
    if (content !== undefined) {
      // Check for empty files
      for (const { pattern, message } of EMPTY_FILE_PATTERNS) {
        if (pattern.test(content) && content.trim().length < 10) {
          issues.push({
            type: 'warning',
            message: `${message}: ${file_path}`,
            path: file_path,
            suggestion: 'Verify file has expected content'
          })
        }
      }
      
      // Check for null settings in JSON files
      if (file_path.endsWith('.json') || file_path.endsWith('.jsonc')) {
        for (const { pattern, message } of NULL_SETTINGS_PATTERNS) {
          if (pattern.test(content)) {
            issues.push({
              type: 'info',
              message: `${message} in ${file_path}`,
              path: file_path,
              suggestion: 'Verify setting has correct value'
            })
          }
        }
      }
    }
    
    // Check directory contents
    if (existsSync(file_path) && statSync(file_path).isDirectory()) {
      const files = readdirSync(file_path)
      
      if (files.length === 0) {
        issues.push({
          type: 'warning',
          message: `Directory is empty: ${file_path}`,
          path: file_path,
          suggestion: 'Verify directory should contain files'
        })
      } else {
        // Check for empty files in directory
        for (const file of files) {
          const filePath = join(file_path, file)
          if (existsSync(filePath) && statSync(filePath).isFile()) {
            const content = readFileSync(filePath, 'utf-8')
            if (content.trim().length === 0) {
              issues.push({
                type: 'warning',
                message: `Empty file in directory: ${filePath}`,
                path: filePath,
                suggestion: 'Verify file has expected content'
              })
            }
          }
        }
      }
    }
    
    // Check settings files
    if (file_path.includes('settings.json') || file_path.includes('config.json')) {
      if (content) {
        try {
          const settings = JSON.parse(content)
          
          // Check for null/empty values
          for (const [key, value] of Object.entries(settings)) {
            if (value === null || value === undefined) {
              issues.push({
                type: 'warning',
                message: `Setting "${key}" is null/undefined`,
                path: file_path,
                suggestion: `Set "${key}" to a valid value`
              })
            }
            if (value === "" || value === "—") {
              issues.push({
                type: 'info',
                message: `Setting "${key}" is placeholder`,
                path: file_path,
                suggestion: `Update "${key}" with actual value`
              })
            }
          }
        } catch (e) {
          // JSON parse error - already handled elsewhere
        }
      }
    }
    
    // Show issues
    const warnings = issues.filter(i => i.type === 'warning')
    const infos = issues.filter(i => i.type === 'info')
    
    if (warnings.length > 0) {
      ctx.ui.toast({
        variant: 'warning',
        title: 'Runtime State Issues',
        message: warnings.map(w => w.message).join('\n'),
        duration: 7000
      })
    }
    
    if (infos.length > 0 && warnings.length === 0) {
      ctx.ui.toast({
        variant: 'info',
        title: 'Runtime State Info',
        message: infos.map(i => i.message).join('\n'),
        duration: 5000
      })
    }
    
    return { proceed: true }
  }
}

export default runtimeStateValidator
