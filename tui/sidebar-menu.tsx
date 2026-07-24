import type { TuiPlugin, TuiPluginModule } from "@mimo-ai/plugin/tui"

interface MenuItem {
  label: string
  action: () => void
  icon: string
}

const tui: TuiPlugin = async (api) => {
  const theme = () => api.theme.current

  // Register sidebar menu items
  api.slots.register({
    slots: {
      sidebar_menu: (props) => {
        const menuItems: MenuItem[] = [
          {
            label: "Git Status",
            icon: " ",
            action: () => {
              const { execSync } = require("child_process")
              try {
                const status = execSync("git status --short", { encoding: "utf-8", timeout: 5000 }).trim()
                const branch = execSync("git branch --show-current", { encoding: "utf-8", timeout: 5000 }).trim()
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
            label: "Run Tests",
            icon: " ",
            action: () => {
              api.ui.toast({ variant: "info", message: "Run: npm test" })
            },
          },
          {
            label: "Lint Code",
            icon: " ",
            action: () => {
              api.ui.toast({ variant: "info", message: "Run: npm run lint" })
            },
          },
          {
            label: "Build",
            icon: " ",
            action: () => {
              api.ui.toast({ variant: "info", message: "Run: npm run build" })
            },
          },
          {
            label: "Model Info",
            icon: " ",
            action: () => {
              const configPath = require("path").join(process.env.HOME || process.env.USERPROFILE || "", ".config", "mimocode", "mimocode.jsonc")
              try {
                const config = JSON.parse(require("fs").readFileSync(configPath, "utf-8").replace(/\/\/.*$/gm, "").replace(/,\s*([\]}])/g, "$1"))
                api.ui.toast({
                  variant: "info",
                  title: "Current Model",
                  message: config.model || "Not configured",
                  duration: 5000,
                })
              } catch (e) {
                api.ui.toast({ variant: "error", message: "Could not read config" })
              }
            },
          },
          {
            label: "Extensions",
            icon: " ",
            action: () => {
              api.route.navigate("extensions")
            },
          },
          {
            label: "Help",
            icon: "❓",
            action: () => {
              api.ui.toast({
                variant: "info",
                title: "Quick Help",
                message: "Ctrl+E: Extensions | Ctrl+G: Git | Ctrl+T: Tests",
                duration: 7000,
              })
            },
          },
        ]

        return (
          <box flexDirection="column" padding={1}>
            <text>
              <b>Quick Actions</b>
            </text>
            <text> </text>
            {menuItems.map((item, index) => (
              <text
                key={index}
                fg={theme().primary}
                onClick={item.action}
                style={{ cursor: "pointer" }}
              >
                {item.icon} {item.label}
              </text>
            ))}
          </box>
        )
      },
    },
  })

  // Register commands for each menu item
  api.command.register(() => [
    {
      title: "Git Status",
      value: "sidebar-git",
      description: "Show git status",
      category: "Sidebar",
      keybind: "ctrl+g",
      suggested: true,
      onSelect: () => {
        const { execSync } = require("child_process")
        try {
          const status = execSync("git status --short", { encoding: "utf-8", timeout: 5000 }).trim()
          const branch = execSync("git branch --show-current", { encoding: "utf-8", timeout: 5000 }).trim()
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
      value: "sidebar-tests",
      description: "Run test suite",
      category: "Sidebar",
      keybind: "ctrl+t",
      onSelect: () => {
        api.ui.toast({ variant: "info", message: "Run: npm test" })
      },
    },
    {
      title: "Build Project",
      value: "sidebar-build",
      description: "Build the project",
      category: "Sidebar",
      keybind: "ctrl+b",
      onSelect: () => {
        api.ui.toast({ variant: "info", message: "Run: npm run build" })
      },
    },
    {
      title: "Open Extensions",
      value: "sidebar-extensions",
      description: "View installed extensions",
      category: "Sidebar",
      keybind: "ctrl+shift+e",
      onSelect: () => api.route.navigate("extensions"),
    },
  ])
}

const plugin: TuiPluginModule & { id: string } = {
  id: "sidebar-menu",
  tui,
}

export default plugin
