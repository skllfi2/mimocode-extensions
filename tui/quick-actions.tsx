import type { TuiPlugin, TuiPluginModule } from "@mimo-ai/plugin/tui"

const tui: TuiPlugin = async (api) => {
  // Register quick action commands
  api.command.register(() => [
    {
      title: "Git Status",
      value: "git-status",
      description: "Show current git status",
      category: "Git",
      keybind: "ctrl+g",
      suggested: true,
      onSelect: async () => {
        const { execSync } = require("child_process")
        try {
          const status = execSync("git status --short", { encoding: "utf-8", timeout: 5000 }).trim()
          const branch = execSync("git branch --show-current", { encoding: "utf-5", timeout: 5000 }).trim()
          api.ui.toast({
            variant: "info",
            title: `Git: ${branch}`,
            message: status || "Working tree clean",
            duration: 5000,
          })
        } catch (e: any) {
          api.ui.toast({ variant: "error", message: e.message })
        }
      },
    },
    {
      title: "Run Tests",
      value: "run-tests",
      description: "Execute test suite",
      category: "Dev",
      keybind: "ctrl+t",
      onSelect: () => {
        api.ui.toast({
          variant: "info",
          message: "Run: npm test",
        })
      },
    },
    {
      title: "Lint Code",
      value: "lint-code",
      description: "Run linter",
      category: "Dev",
      onSelect: () => {
        api.ui.toast({
          variant: "info",
          message: "Run: npm run lint",
        })
      },
    },
    {
      title: "Build Project",
      value: "build-project",
      description: "Build the project",
      category: "Dev",
      keybind: "ctrl+b",
      onSelect: () => {
        api.ui.toast({
          variant: "info",
          message: "Run: npm run build",
        })
      },
    },
    {
      title: "Weather",
      value: "weather",
      description: "Check current weather",
      category: "Info",
      onSelect: () => {
        api.ui.toast({
          variant: "info",
          message: "Use tool: weather",
        })
      },
    },
    {
      title: "Show Session Log",
      value: "session-log",
      description: "View recent session history",
      category: "Info",
      onSelect: () => {
        api.ui.toast({
          variant: "info",
          message: "Use tool: session-manager action=list",
        })
      },
    },
  ])
}

const plugin: TuiPluginModule & { id: string } = {
  id: "quick-actions",
  tui,
}

export default plugin
