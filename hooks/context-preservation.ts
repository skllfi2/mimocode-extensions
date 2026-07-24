import type { Hooks } from "@mimo-ai/plugin"

const PRESERVED_KEYS = ["TODO:", "FIXME:", "HACK:", "NOTE:", "IMPORTANT:"]

export default {
  "experimental.session.compacting": async (input, output) => {
    const context = output.context ?? []

    context.push(
      "Preserve all TODO, FIXME, HACK, NOTE, and IMPORTANT markers from the original context.",
      "Preserve any file paths that were read or modified.",
      "Preserve any task IDs and their current status.",
      "Preserve the user's original request and any constraints they specified.",
    )

    output.context = context
  },
} satisfies Hooks
