import type { Hooks } from "@mimo-ai/plugin"

const readFiles = new Map<string, Set<string>>()

export default {
  "tool.execute.after": async (input, output) => {
    if (input.tool === "read") {
      const filePath = input.args?.file_path
      if (filePath) {
        const sessionReads = readFiles.get(input.sessionID) ?? new Set()
        sessionReads.add(filePath)
        readFiles.set(input.sessionID, sessionReads)
      }
    }
  },

  "tool.execute.before": async (input, output) => {
    if (input.tool !== "write" && input.tool !== "edit") return

    const filePath = output.args?.file_path
    if (!filePath) return

    const sessionReads = readFiles.get(input.sessionID)
    if (!sessionReads?.has(filePath)) {
      output.cancel = true
      output.cancelReason =
        `Blocked: file "${filePath}" has not been read in this session. ` +
        "Read it first with the read tool before writing."
    }
  },

  "session.pre": async (input, output) => {
    readFiles.set(input.sessionID, new Set())
  },
} satisfies Hooks
