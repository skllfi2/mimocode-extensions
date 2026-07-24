import type { Hooks } from "@mimo-ai/plugin"
import { readFileSync, readdirSync, existsSync } from "fs"
import { join } from "path"

const RULES_DIRS = [
  ".mimocode/rules",
  ".claude/rules",
  ".codex/rules",
]

export default {
  "experimental.chat.system.transform": async (input, output) => {
    const collected: string[] = []

    for (const dir of RULES_DIRS) {
      if (!existsSync(dir)) continue

      try {
        const files = readdirSync(dir).filter((f) => f.endsWith(".md"))
        for (const file of files) {
          try {
            const content = readFileSync(join(dir, file), "utf-8").trim()
            if (content) {
              collected.push(`## Rule: ${file}\n${content}`)
            }
          } catch {}
        }
      } catch {}
    }

    if (collected.length > 0) {
      output.system.push(
        "## Project Rules (auto-injected)\n\n" + collected.join("\n\n---\n\n")
      )
    }
  },
} satisfies Hooks
