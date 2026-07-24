import type { Hooks } from "@mimo-ai/plugin"

const toolPairs = new Map<string, string[]>()

export default {
  "tool.execute.after": async (input, output) => {
    const sessionId = input.sessionID
    const tool = input.tool

    const pairs = toolPairs.get(sessionId) ?? []
    pairs.push(tool)
    toolPairs.set(sessionId, pairs.slice(-10))

    if (tool === "write" || tool === "edit") {
      const prevTools = pairs.slice(0, -1)
      const lastTool = prevTools[prevTools.length - 1]

      if (lastTool !== "read") {
        output.metadata = {
          ...output.metadata,
          toolPairWarning: "You wrote to a file without reading it first. This may cause data loss.",
        }
      }
    }
  },

  "session.pre": async (input) => {
    toolPairs.set(input.sessionID, [])
  },

  "session.post": async (input) => {
    toolPairs.delete(input.sessionID)
  },
} satisfies Hooks
