import type { Hook } from "@mimo-ai/plugin"

/**
 * Configuration Validator Hook
 * 
 * Validates configuration files and paths before execution.
 * Based on analysis of common configuration errors.
 * 
 * Checks:
 * - File path validity
 * - JSON/JSONC syntax
 * - Required fields
 * - Environment variables
 */

interface ConfigIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  file?: string
  line?: number
}

const PATH_ISSUES = [
  { pattern: /\\\\\\\\/, message: 'Double backslashes in path', severity: 'error' },
  { pattern: /[A-Z]:\\\\[^\\]/, message: 'Missing trailing slash', severity: 'warning' },
  { pattern: /\s{2,}/, message: 'Multiple spaces in path', severity: 'error' },
  { pattern: /\$\{[^}]+\}/, message: 'Unresolved variable in path', severity: 'warning' },
  { pattern: /\/tmp\//, message: 'Temporary path may not persist', severity: 'info' },
]

const JSON_ISSUES = [
  { pattern: /,\s*[\]}]/, message: 'Trailing comma', severity: 'error' },
  { pattern: /"([^"]+)"\s*:\s*"([^"]*"[^"]*)"/, message: 'Unescaped quote in value', severity: 'error' },
  { pattern: /\/\/.*$/gm, message: 'Comment in JSON (use JSONC)', severity: 'info' },
]

const CONFIG_FIELDS = [
  { field: 'model', required: true, message: 'Missing model configuration' },
  { field: 'provider', required: true, message: 'Missing provider configuration' },
  { field: 'apiKey', required: false, message: 'API key not configured', severity: 'warning' },
]

export const configValidator: Hook = {
  name: 'config-validator',
  event: 'tool.execute.before',
  filter: { tool: ['bash', 'write', 'edit'] },
  
  handler: async (ctx) => {
    const { command, content, file_path } = ctx.params as any
    const issues: ConfigIssue[] = []
    
    // Validate file paths
    if (file_path) {
      for (const { pattern, message, severity } of PATH_ISSUES) {
        if (pattern.test(file_path)) {
          issues.push({
            type: severity as any,
            message,
            file: file_path
          })
        }
      }
    }
    
    // Validate JSON/JSONC content
    if (content && (file_path?.endsWith('.json') || file_path?.endsWith('.jsonc'))) {
      for (const { pattern, message, severity } of JSON_ISSUES) {
        if (pattern.test(content)) {
          issues.push({
            type: severity as any,
            message,
            file: file_path
          })
        }
      }
      
      // Check for required config fields
      if (file_path.includes('mimocode')) {
        for (const { field, required, message, severity } of CONFIG_FIELDS) {
          if (required && !content.includes(`"${field}"`)) {
            issues.push({
              type: severity as any || 'error',
              message,
              file: file_path
            })
          }
        }
      }
    }
    
    // Validate bash commands
    if (command) {
      // Check for dangerous path operations
      if (command.includes('rm -rf') && !command.includes('/tmp')) {
        issues.push({
          type: 'warning',
          message: 'Recursive delete outside /tmp'
        })
      }
      
      // Check for missing quotes
      if (command.match(/cd [^"'][\s]/)) {
        issues.push({
          type: 'warning',
          message: 'Path with spaces should be quoted'
        })
      }
    }
    
    // Handle issues
    const errors = issues.filter(i => i.type === 'error')
    const warnings = issues.filter(i => i.type === 'warning')
    
    if (errors.length > 0) {
      ctx.ui.toast({
        variant: 'error',
        title: 'Configuration Errors',
        message: errors.map(e => e.message).join('\n'),
        duration: 10000
      })
      
      return {
        block: true,
        message: `Blocked: ${errors.length} configuration error(s)`
      }
    }
    
    if (warnings.length > 0) {
      ctx.ui.toast({
        variant: 'warning',
        title: 'Configuration Warnings',
        message: warnings.map(w => w.message).join('\n'),
        duration: 7000
      })
    }
    
    return { proceed: true }
  }
}

export default configValidator
