import type { Hooks } from "@mimo-ai/plugin"

const INTENT_KEYWORDS: Record<string, { keywords: RegExp; mode: string }> = {
  ultrawork: {
    keywords: /\b(ultrawork|ulw)\b/i,
    mode: "ultrawork",
  },
  research: {
    keywords: /\b(research|investigate|deep dive|deep research)\b/i,
    mode: "research",
  },
  plan: {
    keywords: /\b(plan|design|architect|blueprint)\b/i,
    mode: "planning",
  },
  fix: {
    keywords: /\b(fix|debug|repair|patch|hotfix)\b/i,
    mode: "debugging",
  },
  refactor: {
    keywords: /\b(refactor|clean up|restructure|reorganize)\b/i,
    mode: "refactoring",
  },
}

export default {
  "experimental.chat.messages.transform": async (input, output) => {
    const lastMsg = output.messages[output.messages.length - 1]
    if (!lastMsg) return

    const text = lastMsg.parts
      .filter((p: any) => p.type === "text")
      .map((p: any) => p.text)
      .join(" ")

    for (const [key, { keywords, mode }] of Object.entries(INTENT_KEYWORDS)) {
      if (keywords.test(text)) {
        output.messages.push({
          info: {
            role: "user",
            id: `intent-gate-${key}-${Date.now()}`,
          },
          parts: [
            {
              type: "text",
              text: `[IntentGate] Detected intent: ${mode}. Adjust your approach accordingly.`,
            },
          ],
        })
        break
      }
    }
  },
} satisfies Hooks
