import type { Hooks } from "@mimo-ai/plugin"

const START_KEYWORDS = /\b(start.work|begin.work|let's.go|go|start|begin|do.it)\b/i

export default {
  "experimental.chat.messages.transform": async (input, output) => {
    const messages = output.messages
    const lastMsg = messages[messages.length - 1]
    if (!lastMsg) return

    const text = lastMsg.parts
      ?.filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join(" ") ?? ""

    if (!START_KEYWORDS.test(text)) return

    const isWorkRequest = /(?:implement|build|create|fix|refactor|add|write|code)/i.test(text)
    if (!isWorkRequest) return

    messages.push({
      info: {
        role: "user",
        id: `start-work-${Date.now()}`,
      },
      parts: [
        {
          type: "text",
          text: `[StartWork] Before beginning, briefly plan:
1. What exactly needs to be done
2. Which files will be affected
3. What could go wrong
4. How to verify success

Then execute the plan. Don't ask for permission — just do it.`,
        },
      ],
    })
  },
} satisfies Hooks
