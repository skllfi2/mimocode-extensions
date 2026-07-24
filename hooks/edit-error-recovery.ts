import type { Hooks } from "@mimo-ai/plugin"

const RETRY_COUNTS = new Map<string, number>()

export default {
  "tool.execute.after": async (input, output) => {
    if (input.tool !== "edit") return

    const result = output.output ?? ""
    const callId = input.callID

    if (result.includes("old_string not found") || result.includes("Failed to apply")) {
      const count = (RETRY_COUNTS.get(callId) ?? 0) + 1
      RETRY_COUNTS.set(callId, count)

      if (count < 3) {
        output.output = result +
          "\n\n[EditErrorRecovery] The edit failed. Try reading the file again with the read tool to get the current content, then apply the edit with the exact text from the file."
      }
    }
  },

  "session.pre": async () => {
    RETRY_COUNTS.clear()
  },
} satisfies Hooks
