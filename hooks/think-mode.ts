import type { Hooks } from "@mimo-ai/plugin"

const THINK_KEYWORDS = /\b(think|reason|analyze deeply|step by step|chain.of.thought|cot)\b/i

export default {
  "chat.params": async (input, output) => {
    const lastMessages = (input as any).messages ?? []
    const lastMsg = lastMessages[lastMessages.length - 1]
    if (!lastMsg) return

    const text = typeof lastMsg === "string" ? lastMsg : lastMsg.content ?? ""
    if (THINK_KEYWORDS.test(text)) {
      output.options = {
        ...output.options,
        thinking: {
          type: "enabled",
          budget_tokens: 10000,
        },
      }
    }
  },

  "experimental.chat.messages.transform": async (input, output) => {
    const messages = output.messages
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg) return

    const text = lastMsg.parts
      ?.filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join(" ") ?? ""

    if (THINK_KEYWORDS.test(text)) {
      messages.push({
        info: {
          role: "user",
          id: `think-mode-${Date.now()}`,
        },
        parts: [
          {
            type: "text",
            text: "[ThinkMode] Take your time. Reason step by step before answering.",
          },
        ],
      })
    }
  },
} satisfies Hooks
