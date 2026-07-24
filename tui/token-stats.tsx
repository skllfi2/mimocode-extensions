import type { TuiPlugin, TuiPluginModule } from "@mimo-ai/plugin/tui"
import { readFileSync, existsSync } from "fs"
import { join } from "path"

interface TokenStats {
  input: number
  output: number
  cache: number
  cost: number
}

function loadTokenStats(): TokenStats {
  const statsPath = join(process.env.HOME || process.env.USERPROFILE || "", ".local", "share", "mimocode", "stats.json")
  
  if (existsSync(statsPath)) {
    try {
      const stats = JSON.parse(readFileSync(statsPath, "utf-8"))
      return {
        input: stats.input || 0,
        output: stats.output || 0,
        cache: stats.cache || 0,
        cost: stats.cost || 0,
      }
    } catch (e) {
      // Stats parse error
    }
  }
  
  return { input: 0, output: 0, cache: 0, cost: 0 }
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000000000) {
    return `${(tokens / 1000000000).toFixed(1)}B`
  }
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`
  }
  return tokens.toString()
}

const tui: TuiPlugin = async (api) => {
  const theme = () => api.theme.current

  // Add token stats to sidebar
  api.slots.register({
    slots: {
      sidebar_token_stats: (props) => {
        const stats = loadTokenStats()
        const totalTokens = stats.input + stats.output + stats.cache

        return (
          <box flexDirection="column" gap={1}>
            <text>
              <b>Token Usage</b>
            </text>
            <text fg={theme().primary}>
              Input: {formatTokens(stats.input)}
            </text>
            <text fg={theme().success}>
              Output: {formatTokens(stats.output)}
            </text>
            <text fg={theme().textMuted}>
              Cache: {formatTokens(stats.cache)}
            </text>
            <text> </text>
            <text>
              <b>Total: {formatTokens(totalTokens)}</b>
            </text>
            {stats.cost > 0 && (
              <text fg={theme().warning}>
                Cost: ${stats.cost.toFixed(2)}
              </text>
            )}
          </box>
        )
      },
    },
  })

  // Register command to show token stats
  api.command.register(() => [
    {
      title: "Token Stats",
      value: "token-stats",
      description: "Show token usage statistics",
      category: "Info",
      keybind: "ctrl+shift+t",
      onSelect: () => {
        const stats = loadTokenStats()
        const totalTokens = stats.input + stats.output + stats.cache
        api.ui.toast({
          variant: "info",
          title: "Token Usage",
          message: `Total: ${formatTokens(totalTokens)} | Cost: $${stats.cost.toFixed(2)}`,
          duration: 7000,
        })
      },
    },
    {
      title: "Reset Token Stats",
      value: "reset-token-stats",
      description: "Reset token usage counters",
      category: "Info",
      onSelect: () => {
        api.ui.toast({
          variant: "warning",
          message: "Token stats will reset on next session",
        })
      },
    },
  ])
}

const plugin: TuiPluginModule & { id: string } = {
  id: "token-stats",
  tui,
}

export default plugin
