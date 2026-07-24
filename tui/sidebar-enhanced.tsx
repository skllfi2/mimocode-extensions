import type { TuiPlugin, TuiPluginModule } from "@mimo-ai/plugin/tui"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

interface McpServer {
  name: string
  status: "active" | "inactive" | "error"
}

function loadMcpServers(): McpServer[] {
  const servers: McpServer[] = []
  const configPath = join(process.env.HOME || process.env.USERPROFILE || "", ".config", "mimocode", "mimocode.jsonc")
  
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, "utf-8").replace(/\/\/.*$/gm, "").replace(/,\s*([\]}])/g, "$1"))
      if (config.mcp) {
        for (const [name, _] of Object.entries(config.mcp)) {
          servers.push({ name, status: "active" })
        }
      }
    } catch (e) {
      // Config parse error
    }
  }
  
  return servers
}

function getModelInfo(): { model: string; provider: string } {
  const configPath = join(process.env.HOME || process.env.USERPROFILE || "", ".config", "mimocode", "mimocode.jsonc")
  
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, "utf-8").replace(/\/\/.*$/gm, "").replace(/,\s*([\]}])/g, "$1"))
      const model = config.model || "unknown"
      const [provider] = model.split("/")
      return { model, provider }
    } catch (e) {
      // Config parse error
    }
  }
  
  return { model: "unknown", provider: "unknown" }
}

const tui: TuiPlugin = async (api) => {
  const theme = () => api.theme.current

  // Enhanced sidebar content
  api.slots.register({
    slots: {
      sidebar_content: (props) => {
        const branch = () => api.state.vcs?.branch ?? "no git"
        const messages = () => api.state.session.messages(props.session_id)
        const msgCount = () => messages()?.length ?? 0
        const modelInfo = getModelInfo()
        const mcpServers = loadMcpServers()

        return (
          <box flexDirection="column" gap={1}>
            {/* Project Info */}
            <text>
              <b>Project</b>
            </text>
            <text fg={theme().textMuted}>
              Branch: {branch()}
            </text>
            <text fg={theme().textMuted}>
              Messages: {msgCount()}
            </text>
            <text> </text>

            {/* Model Info */}
            <text>
              <b>Model</b>
            </text>
            <text fg={theme().primary}>
              {modelInfo.model.split("/").pop()}
            </text>
            <text fg={theme().textMuted}>
              Provider: {modelInfo.provider}
            </text>
            <text> </text>

            {/* MCP Servers */}
            {mcpServers.length > 0 && (
              <>
                <text>
                  <b>MCP Servers ({mcpServers.length})</b>
                </text>
                {mcpServers.slice(0, 5).map((server) => (
                  <text fg={theme().success}>
                    + {server.name}
                  </text>
                ))}
                {mcpServers.length > 5 && (
                  <text fg={theme().textMuted}>
                    ... and {mcpServers.length - 5} more
                  </text>
                )}
              </>
            )}
          </box>
        )
      },
    },
  })

  // Register sidebar commands
  api.command.register(() => [
    {
      title: "Toggle Sidebar",
      value: "toggle-sidebar",
      description: "Show/hide the sidebar",
      category: "View",
      keybind: "ctrl+shift+s",
      onSelect: () => api.ui.toast({ variant: "info", message: "Sidebar toggled" }),
    },
    {
      title: "Model Info",
      value: "model-info",
      description: "Show current model details",
      category: "Info",
      onSelect: () => {
        const info = getModelInfo()
        api.ui.toast({
          variant: "info",
          title: "Current Model",
          message: `${info.model} (${info.provider})`,
          duration: 5000,
        })
      },
    },
    {
      title: "MCP Status",
      value: "mcp-status",
      description: "Show MCP server status",
      category: "Info",
      onSelect: () => {
        const servers = loadMcpServers()
        api.ui.toast({
          variant: "info",
          title: "MCP Servers",
          message: `${servers.length} servers active`,
          duration: 5000,
        })
      },
    },
  ])
}

const plugin: TuiPluginModule & { id: string } = {
  id: "sidebar-enhanced",
  tui,
}

export default plugin
