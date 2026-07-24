import type { TuiPlugin, TuiPluginModule } from "@mimo-ai/plugin/tui"

const tui: TuiPlugin = async (api) => {
  const theme = () => api.theme.current

  // Register session dashboard route
  api.route.register([
    {
      name: "session-dashboard",
      render: () => {
        const sessionCount = api.state.session.count()
        const branch = api.state.vcs?.branch ?? "detached"
        const directory = api.state.path.directory ?? "unknown"

        return (
          <box flexDirection="column" padding={1}>
            <text>
              <b>Session Dashboard</b>
            </text>
            <text> </text>

            <text fg={theme().primary}>Project</text>
            <text>  Directory: {directory}</text>
            <text>  Branch: {branch}</text>
            <text> </text>

            <text fg={theme().primary}>Sessions</text>
            <text>  Active: {sessionCount}</text>
            <text> </text>

            <text fg={theme().primary}>Quick Actions</text>
            <text fg={theme().textMuted}>  Ctrl+E - Extensions</text>
            <text fg={theme().textMuted}>  Ctrl+K - Command Palette</text>
          </box>
        )
      },
    },
  ])

  // Register command
  api.command.register(() => [
    {
      title: "Session Dashboard",
      value: "session-dashboard",
      description: "View session info and project status",
      category: "Info",
      keybind: "ctrl+d",
      onSelect: () => api.route.navigate("session-dashboard"),
    },
  ])
}

const plugin: TuiPluginModule & { id: string } = {
  id: "session-dashboard",
  tui,
}

export default plugin
