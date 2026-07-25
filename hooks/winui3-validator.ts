import type { Hook } from "@mimo-ai/plugin"

/**
 * Consolidated WinUI3 Validator Hook
 * 
 * Merges winui-validator.ts and winui3-comprehensive-validator.ts
 * Optimized for token efficiency with caching.
 */

interface WinUI3Issue {
  type: 'error' | 'warning' | 'info'
  message: string
  file?: string
}

// Cache for validation results
const validationCache = new Map<string, { issues: WinUI3Issue[]; timestamp: number }>()
const CACHE_TTL = 60000 // 1 minute

// Combined patterns (optimized)
const PATTERNS = [
  // UI Thread
  { p: /\.Text\s*=|\.Value\s*=|\.IsEnabled\s*=/, ctx: /Task\.Run|ThreadPool/, m: 'UI from background thread', s: 'error', c: 'UI Thread' },
  
  // Theme
  { p: /\{StaticResource\s+\w+Brush\}/, m: 'StaticResource - no theme update', s: 'warning', c: 'Theme' },
  
  // Memory leaks
  { p: /Loaded\s*\+=/, m: 'Loaded subscription', s: 'warning', c: 'Leak' },
  { p: /PropertyChanged\s*\+=/, m: 'PropertyChanged subscription', s: 'warning', c: 'Leak' },
  
  // Binding
  { p: /x:Bind(?!.*Mode=)/, m: 'x:Bind defaults to OneTime', s: 'info', c: 'Binding' },
  { p: /StringToVisibilityConverter/, m: 'Returns Visibility, not bool', s: 'warning', c: 'Binding' },
  { p: /Text\s*=\s*"\{Binding.*TwoWay/, m: 'TwoWay binding conflict', s: 'warning', c: 'Binding' },
  
  // Process
  { p: /CreateNoWindow\s*=\s*true/, m: 'Insufficient for child processes', s: 'warning', c: 'Process' },
  { p: /Environment\.Exit\(0\)/, m: 'Unreliable in WinUI 3', s: 'warning', c: 'Process' },
  { p: /WaitForExitAsync/, m: 'May hang with stdout', s: 'warning', c: 'Process' },
  
  // Input
  { p: /VirtualKey\.D[0-9]/, m: 'Use Number1-Number9', s: 'warning', c: 'Input' },
  
  // Async
  { p: /_\s*=\s*\w+Async\(\)/, m: 'Fire-and-forget async', s: 'warning', c: 'Async' },
  { p: /StopAsync.*CancellationToken\.None/, m: 'Cannot be cancelled', s: 'warning', c: 'Async' },
]

export const winui3Validator: Hook = {
  name: 'winui3-validator',
  event: 'tool.execute.after',
  filter: { tool: ['write', 'edit'] },
  
  handler: async (ctx) => {
    const { content, file_path } = ctx.params as any
    
    // Only check C# and XAML
    if (!file_path?.endsWith('.cs') && !file_path?.endsWith('.xaml')) {
      return { proceed: true }
    }
    
    // Check cache
    const cached = validationCache.get(file_path)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return { proceed: true }
    }
    
    const issues: WinUI3Issue[] = []
    
    // Check patterns
    for (const { p, ctx: context, m, s, c } of PATTERNS) {
      if (context) {
        if (p.test(content) && context.test(content)) {
          issues.push({ type: s as any, message: `[${c}] ${m}`, file: file_path })
        }
      } else if (p.test(content)) {
        issues.push({ type: s as any, message: `[${c}] ${m}`, file: file_path })
      }
    }
    
    // Cache result
    validationCache.set(file_path, { issues, timestamp: Date.now() })
    
    // Show issues
    const errors = issues.filter(i => i.type === 'error')
    const warnings = issues.filter(i => i.type === 'warning')
    
    if (errors.length > 0) {
      ctx.ui.toast({ variant: 'error', title: 'WinUI3 Errors', message: errors.map(e => e.message).join('\n') })
    }
    
    if (warnings.length > 0) {
      ctx.ui.toast({ variant: 'warning', title: 'WinUI3 Warnings', message: warnings.map(w => w.message).join('\n') })
    }
    
    return { proceed: true }
  }
}

export default winui3Validator
