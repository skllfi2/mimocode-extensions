import type { Hooks } from "@mimo-ai/plugin"

const TASK_FILE = ".mimocode/tasks.json"
const IDLE_THRESHOLD_MS = 5 * 60 * 1000

const lastActivity = new Map<string, number>()

export default {
  "session.userQuery.pre": async (input, output) => {
    lastActivity.set(input.sessionID, Date.now())
  },

  "experimental.chat.messages.transform": async (input, output) => {
    if (!input.sessionID) return

    const last = lastActivity.get(input.sessionID) ?? 0
    const idle = Date.now() - last

    if (idle < IDLE_THRESHOLD_MS) return

    const messages = output.messages
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg) return

    const text = lastMsg.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join(" ")

    if (text.includes("[TodoEnforcer]")) return

    messages.push({
      info: {
        role: "user",
        id: `todo-enforcer-${Date.now()}`,
      },
      parts: [
        {
          type: "text",
          text: "[TodoEnforcer] You've been idle for a while. If you have incomplete tasks, continue working on them. If all tasks are done, summarize what was accomplished.",
        },
      ],
    })

    lastActivity.set(input.sessionID, Date.now())
  },
} satisfies Hooks
