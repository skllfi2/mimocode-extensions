import type { Hooks } from "@mimo-ai/plugin"

const MAX_OUTPUT_CHARS = 40000

export default {
  "tool.execute.after": async (input, output) => {
    const text = output.output ?? ""
    if (text.length <= MAX_OUTPUT_CHARS) return

    const truncated = text.slice(0, MAX_OUTPUT_CHARS) +
      `\n\n... [truncated: ${text.length - MAX_OUTPUT_CHARS} chars omitted, ${text.length} total]`

    output.output = truncated
  },
} satisfies Hooks
