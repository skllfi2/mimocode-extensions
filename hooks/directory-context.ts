import type { Hooks } from "@mimo-ai/plugin"
import { readFileSync, existsSync, readdirSync } from "fs"
import { join } from "path"

function findAgentsFiles(dir: string, depth: number = 3): string[] {
  if (depth <= 0 || !existsSync(dir)) return []

  const results: string[] = []
  const candidates = ["AGENTS.md", "CONTEXT.md", "README.md"]

  for (const name of candidates) {
    const path = join(dir, name)
    if (existsSync(path)) {
      results.push(path)
      break
    }
  }

  try {
    for (const entry of readdirSync(dir)) {
      if (entry === "node_modules" || entry === ".git" || entry === ".mimocode") continue
      const full = join(dir, entry)
      try {
        if (existsSync(full)) {
          const stat = require("fs").statSync(full)
          if (stat.isDirectory()) {
            results.push(...findAgentsFiles(full, depth - 1))
          }
        }
      } catch {}
    }
  } catch {}

  return results
}

export default {
  "experimental.chat.system.transform": async (input, output) => {
    const cwd = process.cwd()
    const files = findAgentsFiles(cwd)

    const contexts: string[] = []
    for (const file of files) {
      try {
        const content = readFileSync(file, "utf-8").trim()
        if (content.length > 0 && content.length < 10000) {
          contexts.push(`## Context: ${file}\n${content}`)
        }
      } catch {}
    }

    if (contexts.length > 0) {
      output.system.push(
        "## Directory Context (auto-injected)\n\n" + contexts.slice(0, 5).join("\n\n---\n\n")
      )
    }
  },
} satisfies Hooks
