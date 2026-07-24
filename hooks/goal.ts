import type { Hooks } from "@mimo-ai/plugin"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

const GOAL_DIR = ".mimocode"
const GOAL_FILE = "current-goal.json"

interface Goal {
  id: string
  description: string
  created: string
  status: "active" | "completed" | "abandoned"
  tasks: string[]
}

function getGoalPath(sessionID: string): string {
  return join(GOAL_DIR, `goal-${sessionID}.json`)
}

function loadGoal(sessionID: string): Goal | null {
  const path = getGoalPath(sessionID)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, "utf-8"))
  } catch {
    return null
  }
}

function saveGoal(sessionID: string, goal: Goal): void {
  if (!existsSync(GOAL_DIR)) mkdirSync(GOAL_DIR, { recursive: true })
  writeFileSync(getGoalPath(sessionID), JSON.stringify(goal, null, 2))
}

export default {
  "experimental.chat.messages.transform": async (input, output) => {
    if (!input.sessionID) return

    const goal = loadGoal(input.sessionID)
    if (!goal || goal.status !== "active") return

    const messages = output.messages
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg) return

    const text = lastMsg.parts
      ?.filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join(" ") ?? ""

    if (text.includes("[GoalReminder]")) return

    const completedTasks = goal.tasks.filter((t) => t.includes("[DONE]")).length
    const totalTasks = goal.tasks.length

    messages.push({
      info: {
        role: "user",
        id: `goal-reminder-${Date.now()}`,
      },
      parts: [
        {
          type: "text",
          text: `[GoalReminder] Active goal: "${goal.description}" (${completedTasks}/${totalTasks} tasks done). Continue working toward this goal.`,
        },
      ],
    })
  },
} satisfies Hooks
