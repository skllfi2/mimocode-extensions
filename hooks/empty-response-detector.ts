import type { Hooks } from "@mimo-ai/plugin"

export default {
  "session.userQuery.post": async (input, output) => {
    const text = input.finalText ?? ""
    const trimmed = text.trim()

    if (trimmed.length < 10) {
      output.continue = true
      output.reason = "Your response was too short. Please provide a more complete answer or continue working on the task."
    }
  },
} satisfies Hooks
