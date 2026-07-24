import type { TuiPlugin, TuiPluginModule } from "@mimo-ai/plugin/tui"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

interface McpServer {
  name: string
  command: string[]
  status: "active" | "inactive" | "error"
}

function loadMcpServers(): McpServer[] {
  const servers: McpServer[] = []
  const configPath = join(process.env.HOME || process.env.USERPROFILE || "", ".config", "mimocode", "mimocode.jsonc")
  
  if (existsSync(configPath)) {
    try {
      const config = JSON.parse(readFileSync(configPath, "utf-8").replace(/\/\/.*$/gm, "").replace(/,\s*([\]}])/g, "$1"))
      if (config.mcp) {
        for (const [name, serverConfig] of Object.entries(config.mcp)) {
          const server = serverConfig as any
          servers.push({
            name,
            command: server.command || [],
            status: "active",
          })
        }
      }
    } catch (e) {
      // Config parse error
    }
  }
  
  return servers
}

const tui: TuiPlugin = async (api) => {
  const theme = () => api.theme.current

  // Register route for MCP panel
  api.route.register([
    {
      name: "mcp-panel",
      render: () => {
        const servers = loadMcpServers()

        return (
          <box flexDirection="column" padding={1}>
            <text>
              <b>MCP Servers</b>
            </text>
            <text fg={theme().textMuted}>Total: {servers.length} servers</text>
            <text> </text>

            {servers.map((server, index) => (
              <box key={index} flexDirection="column" marginBottom={1}>
                <text>
                  <b>{server.name}</b>
                </text>
                <text fg={theme().textMuted}>
                  Command: {server.command.join(" ")}
                </text>
                <text fg={theme().success}>
                  Status: {server.status}
                </text>
              </box>
            ))}

            {servers.length === 0 && (
              <text fg={theme().warning}>
                No MCP servers configured
              </text>
            )}
          </box>
        )
      },
    },
  ])

  // Register command to open MCP panel
  api.command.register(() => [
    {
      title: "MCP Panel",
      value: "mcp-panel",
      description: "View MCP server status",
      category: "MCP",
      keybind: "ctrl+shift+m",
      onSelect: () => api.route.navigate("mcp-panel"),
    },
    {
      title: "MCP Status",
      value: "mcp-status",
      description: "Quick MCP server status",
      category: "MCP",
      onSelect: () => {
        const servers = loadMcpServers()
        const active = servers.filter((s) => s.status === "active").length
        api.ui.toast({
          variant: "info",
          title: "MCP Status",
          message: `${active}/${servers.length} servers active`,
          duration: 5000,
        })
      },
    },
  ])
}

const plugin: TuiPluginModule & { id: string } = {
  id: "mcp-panel",
  tui,
}

export default plugin
