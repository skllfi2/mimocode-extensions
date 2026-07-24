import type { TuiPlugin, TuiPluginModule } from "@mimo-ai/plugin/tui"

const tui: TuiPlugin = async (api) => {
  const theme = () => api.theme.current

  // Register all extension commands
  api.command.register(() => [
    {
      title: "List Active Extensions",
      value: "ext-list",
      description: "Show all installed hooks, tools, and skills",
      category: "Extensions",
      keybind: "ctrl+e",
      suggested: true,
      onSelect: () => {
        api.ui.toast({
          variant: "info",
          title: "Extensions",
          message: "21 hooks, 12 tools, 16 skills loaded",
          duration: 4000,
        })
      },
    },
    {
      title: "Quick Audit",
      value: "quick-audit",
      description: "Run project audit",
      category: "Extensions",
      onSelect: () => {
        api.ui.toast({
          variant: "info",
          message: "Run workflow: full-audit",
        })
      },
    },
    {
      title: "Setup Instructions",
      value: "setup-instructions",
      description: "Show installation guide",
      category: "Extensions",
      onSelect: () => {
        api.ui.toast({
          variant: "info",
          title: "Setup",
          message: "git clone https://github.com/skllfi2/mimocode-extensions.git && bash install.sh",
          duration: 6000,
        })
      },
    },
    {
      title: "Open GitHub Repo",
      value: "open-repo",
      description: "Open extensions repository",
      category: "Extensions",
      onSelect: () => {
        api.ui.toast({
          variant: "info",
          message: "https://github.com/skllfi2/mimocode-extensions",
          duration: 5000,
        })
      },
    },
  ])

  // Sidebar footer with session info
  api.slots.register({
    slots: {
      sidebar_footer: (props) => {
        const branch = () => api.state.vcs?.branch ?? "no git"
        const sessions = () => api.state.session.count()

        return (
          <box flexDirection="row" gap={1}>
            <text fg={theme().textMuted}>
              <span style={{ fg: theme().primary }}>{branch()}</span>
            </text>
            <text fg={theme().textMuted}>
              | {sessions()} sessions
            </text>
          </box>
        )
      },
    },
  })

  // Home bottom with extension status
  api.slots.register({
    slots: {
      home_bottom: () => {
        return (
          <box flexDirection="column" padding={1}>
            <text fg={theme().textMuted}>
              Extensions: 21 hooks | 12 tools | 16 skills | Ctrl+E for details
            </text>
          </box>
        )
      },
    },
  })

  // Cleanup
  api.lifecycle.onDispose(() => {})
}

const plugin: TuiPluginModule & { id: string } = {
  id: "mimocode-extensions",
  tui,
}

export default plugin
