import type { Hooks } from "@mimo-ai/plugin"
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"

const TRACK_DIR = ".mimocode/session-logs"

export default {
  "session.post": async (input, output) => {
    try {
      if (!existsSync(TRACK_DIR)) mkdirSync(TRACK_DIR, { recursive: true })

      const date = new Date().toISOString().split("T")[0]
      const logFile = join(TRACK_DIR, `${date}.jsonl`)

      const entry = {
        sessionID: input.sessionID,
        outcome: input.outcome,
        error: input.error,
        timestamp: new Date().toISOString(),
        textLength: input.finalText?.length ?? 0,
      }

      appendFileSync(logFile, JSON.stringify(entry) + "\n")
    } catch {}
  },
} satisfies Hooks
