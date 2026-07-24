import type { TuiPlugin, TuiPluginModule } from "@mimo-ai/plugin/tui"

const tui: TuiPlugin = async (api) => {
  const theme = () => api.theme.current

  // Add status bar to session prompt
  api.slots.register({
    slots: {
      session_prompt_right: (props) => {
        const status = () => api.state.session.status(props.session_id)
        const todo = () => api.state.session.todo(props.session_id)
        const todoCount = () => (todo()?.length ?? 0)

        return (
          <box flexDirection="row" gap={1}>
            <text fg={theme().textMuted}>
              {status() === "running" ? "⚡" : "○"}
            </text>
            {todoCount() > 0 && (
              <text fg={theme().warning}>
                [{todoCount()} tasks]
              </text>
            )}
          </box>
        )
      },
    },
  })

  // Add project info to sidebar
  api.slots.register({
    slots: {
      sidebar_content: (props) => {
        const branch = () => api.state.vcs?.branch ?? "no git"
        const messages = () => api.state.session.messages(props.session_id)
        const msgCount = () => messages()?.length ?? 0

        return (
          <box flexDirection="column" gap={1}>
            <text fg={theme().textMuted}>
              Branch: {branch()}
            </text>
            <text fg={theme().textMuted}>
              Messages: {msgCount()}
            </text>
          </box>
        )
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id: "status-bar",
  tui,
}

export default plugin
