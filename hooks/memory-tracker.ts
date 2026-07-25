import type { Hook } from "@mimo-ai/plugin"

/**
 * Memory Tracker Hook
 * 
 * Tracks project state and prevents knowledge loss.
 * Based on analysis of missing project documentation.
 * 
 * Tracks:
 * - Project registration
 * - Documentation updates
 * - Knowledge persistence
 */

interface ProjectInfo {
  name: string
  path: string
  lastUpdated: number
  hasDocumentation: boolean
}

const projects = new Map<string, ProjectInfo>()
const MEMORY_CHECK_INTERVAL = 3600000 // 1 hour

function getProjectName(path: string): string {
  const parts = path.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1] || parts[parts.length - 2]
}

function hasDocumentation(path: string): boolean {
  // Check for common documentation files
  const docFiles = ['README.md', 'AGENTS.md', 'PLAN.md', 'CONTRIBUTING.md']
  // This is a simplified check - in real implementation, would check filesystem
  return false
}

export const memoryTracker: Hook = {
  name: 'memory-tracker',
  event: 'session.post',
  
  handler: async (ctx) => {
    const { session_id } = ctx.params as any
    const now = Date.now()
    
    // Check for new projects
    const currentDir = process.cwd()
    const projectName = getProjectName(currentDir)
    
    if (!projects.has(currentDir)) {
      projects.set(currentDir, {
        name: projectName,
        path: currentDir,
        lastUpdated: now,
        hasDocumentation: hasDocumentation(currentDir)
      })
      
      // Suggest creating documentation
      ctx.ui.toast({
        variant: 'info',
        title: 'New Project Detected',
        message: `Consider creating AGENTS.md for ${projectName}`,
        duration: 5000
      })
    }
    
    // Update last updated time
    const project = projects.get(currentDir)
    if (project) {
      project.lastUpdated = now
    }
    
    // Check for stale projects
    for (const [path, info] of projects) {
      if (now - info.lastUpdated > 7 * 24 * 60 * 60 * 1000) { // 7 days
        ctx.ui.toast({
          variant: 'warning',
          title: 'Stale Project',
          message: `${info.name} hasn't been updated in 7 days`,
          duration: 5000
        })
      }
    }
    
    return { proceed: true }
  }
}

export default memoryTracker
