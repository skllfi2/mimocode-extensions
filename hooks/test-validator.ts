import type { Hook } from "@mimo-ai/plugin"

/**
 * Test Validator Hook
 * 
 * Validates testing patterns and prevents common test issues.
 * Based on analysis of test failures across multiple projects.
 * 
 * Checks:
 * - Test isolation
 * - Mock consistency
 * - Async test handling
 * - Resource cleanup
 */

interface TestIssue {
  type: 'error' | 'warning' | 'info'
  message: string
  suggestion?: string
  file?: string
}

const TEST_PATTERNS = [
  // Isolation issues
  { 
    pattern: /static\s+.*\s+_/, 
    message: 'Static state can cause test pollution',
    suggestion: 'Use instance state or reset in teardown',
    severity: 'warning' 
  },
  { 
    pattern: /File\.(Write|AppendAll)/, 
    message: 'File I/O in tests can cause flakiness',
    suggestion: 'Use mock file system or temp directories',
    severity: 'warning' 
  },
  
  // Mock issues
  { 
    pattern: /Mock<.*>\(\)\.Setup.*Returns.*null/, 
    message: 'Mock returning null may hide bugs',
    suggestion: 'Consider using It.IsAny<T>() or specific values',
    severity: 'info' 
  },
  { 
    pattern: /It\.IsAny<.*>/, 
    message: 'Overly broad mock matching',
    suggestion: 'Use specific values when possible',
    severity: 'info' 
  },
  
  // Async issues
  { 
    pattern: /async\s+void.*\[Fact\]/, 
    message: 'async void test cannot catch exceptions',
    suggestion: 'Use async Task instead',
    severity: 'error' 
  },
  { 
    pattern: /Assert\.Throws<T>.*async/, 
    message: 'Assert.Throws for async methods',
    suggestion: 'Use Assert.ThrowsAsync<T>',
    severity: 'error' 
  },
  { 
    pattern: /Task\.Delay\(/, 
    message: 'Task.Delay in tests is flaky',
    suggestion: 'Use async wait conditions or mocks',
    severity: 'warning' 
  },
  
  // Resource cleanup
  { 
    pattern: /new\s+Process\(\)/, 
    message: 'Process without using/dispose',
    suggestion: 'Add using statement or IDisposable',
    severity: 'warning' 
  },
  { 
    pattern: /IDisposable/, 
    message: 'IDisposable not implemented',
    suggestion: 'Implement IDisposable for cleanup',
    severity: 'info' 
  },
  
  // Assertion issues
  { 
    pattern: /Assert\.Equal\(true/, 
    message: 'Assert.True is clearer',
    suggestion: 'Use Assert.True(condition)',
    severity: 'info' 
  },
  { 
    pattern: /Assert\.Equal\(false/, 
    message: 'Assert.False is clearer',
    suggestion: 'Use Assert.False(condition)',
    severity: 'info' 
  },
]

export const testValidator: Hook = {
  name: 'test-validator',
  event: 'tool.execute.after',
  filter: { tool: ['write', 'edit'] },
  
  handler: async (ctx) => {
    const { content, file_path } = ctx.params as any
    
    // Only check test files
    if (!file_path?.includes('Test') && !file_path?.includes('test')) {
      return { proceed: true }
    }
    
    const issues: TestIssue[] = []
    
    // Check for test patterns
    for (const { pattern, message, suggestion, severity } of TEST_PATTERNS) {
      if (pattern.test(content)) {
        issues.push({
          type: severity as any,
          message,
          suggestion,
          file: file_path
        })
      }
    }
    
    // Separate by severity
    const errors = issues.filter(i => i.type === 'error')
    const warnings = issues.filter(i => i.type === 'warning')
    const infos = issues.filter(i => i.type === 'info')
    
    // Show errors
    if (errors.length > 0) {
      ctx.ui.toast({
        variant: 'error',
        title: 'Test Errors',
        message: errors.map(e => `${e.message}\n${e.suggestion || ''}`).join('\n'),
        duration: 10000
      })
    }
    
    // Show warnings
    if (warnings.length > 0) {
      ctx.ui.toast({
        variant: 'warning',
        title: 'Test Warnings',
        message: warnings.map(w => w.message).join('\n'),
        duration: 7000
      })
    }
    
    return { proceed: true }
  }
}

export default testValidator
