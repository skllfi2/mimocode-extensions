import type { Hooks } from "@mimo-ai/plugin"

export default {
  "shell.env": async (input, output) => {
    if (!process.stdout.isTTY) {
      output.env.CI = "true"
      output.env.NONINTERACTIVE = "1"
      output.env.TERM = "dumb"
    }

    output.env.TERMUX_VERSION = output.env.TERMUX_VERSION ?? ""
  },

  "chat.params": async (input, output) => {
    if (!process.stdout.isTTY) {
      output.options = {
        ...output.options,
        maxTokens: 4096,
      }
    }
  },
} satisfies Hooks
