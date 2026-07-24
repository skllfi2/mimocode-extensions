import type { TuiPlugin, TuiPluginModule } from "@mimo-ai/plugin/tui"
import { readFileSync, readdirSync, existsSync } from "fs"
import { join } from "path"

interface Extension {
  name: string
  type: "hook" | "tool" | "skill" | "workflow"
  status: "active" | "inactive" | "error"
}

function loadExtensions(): Extension[] {
  const exts: Extension[] = []
  const base = ".mimocode"

  // Load hooks
  const hooksDir = join(base, "hooks")
  if (existsSync(hooksDir)) {
    for (const f of readdirSync(hooksDir)) {
      if (f.endsWith(".ts")) {
        exts.push({ name: f.replace(".ts", ""), type: "hook", status: "active" })
      }
    }
  }

  // Load tools
  const toolsDir = join(base, "tools")
  if (existsSync(toolsDir)) {
    for (const f of readdirSync(toolsDir)) {
      if (f.endsWith(".ts")) {
        exts.push({ name: f.replace(".ts", ""), type: "tool", status: "active" })
      }
    }
  }

  // Load skills
  const skillsDir = join(base, "skills")
  if (existsSync(skillsDir)) {
    for (const d of readdirSync(skillsDir)) {
      const skillFile = join(skillsDir, d, "SKILL.md")
      if (existsSync(skillFile)) {
        exts.push({ name: d, type: "skill", status: "active" })
      }
    }
  }

  // Load workflows
  const workflowsDir = join(base, "workflows")
  if (existsSync(workflowsDir)) {
    for (const f of readdirSync(workflowsDir)) {
      if (f.endsWith(".js")) {
        exts.push({ name: f.replace(".js", ""), type: "workflow", status: "active" })
      }
    }
  }

  return exts
}

const tui: TuiPlugin = async (api) => {
  const theme = () => api.theme.current

  // Register route for extensions panel
  api.route.register([
    {
      name: "extensions",
      render: () => {
        const extensions = loadExtensions()
        const hooks = extensions.filter((e) => e.type === "hook")
        const tools = extensions.filter((e) => e.type === "tool")
        const skills = extensions.filter((e) => e.type === "skill")
        const workflows = extensions.filter((e) => e.type === "workflow")

        return (
          <box flexDirection="column" padding={1}>
            <text>
              <b>MiMoCode Extensions</b>
            </text>
            <text fg={theme().textMuted}>Total: {extensions.length} components</text>
            <text> </text>

            <text>
              <b>Hooks ({hooks.length})</b>
            </text>
            {hooks.map((h) => (
              <text fg={theme().success}>  + {h.name}</text>
            ))}
            <text> </text>

            <text>
              <b>Tools ({tools.length})</b>
            </text>
            {tools.map((t) => (
              <text fg={theme().primary}>  + {t.name}</text>
            ))}
            <text> </text>

            <text>
              <b>Skills ({skills.length})</b>
            </text>
            {skills.map((s) => (
              <text fg={theme().warning}>  + {s.name}</text>
            ))}
            <text> </text>

            <text>
              <b>Workflows ({workflows.length})</b>
            </text>
            {workflows.map((w) => (
              <text fg={theme().textMuted}>  + {w.name}</text>
            ))}
          </box>
        )
      },
    },
  ])

  // Register command to open extensions panel
  api.command.register(() => [
    {
      title: "Extensions Panel",
      value: "extensions-panel",
      description: "View all installed extensions",
      category: "Extensions",
      keybind: "ctrl+shift+e",
      onSelect: () => api.route.navigate("extensions"),
    },
  ])
}

const plugin: TuiPluginModule & { id: string } = {
  id: "extensions-panel",
  tui,
}

export default plugin
