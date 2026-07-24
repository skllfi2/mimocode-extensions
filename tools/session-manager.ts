import { tool } from "@mimo-ai/plugin"
import { readFileSync, readdirSync, existsSync } from "fs"
import { join } from "path"

const SESSION_DIR = ".mimocode/session-logs"

export default tool({
  description: "Manage session logs: list, search, and read past session data",
  args: {
    action: tool.schema.string().describe("'list' to show sessions, 'search' to find in sessions, 'read' to view a session"),
    query: tool.schema.string().optional().describe("Search query or date (YYYY-MM-DD)"),
    limit: tool.schema.number().optional().describe("Max results (default: 10)"),
  },
  async execute(args) {
    const { action, query, limit = 10 } = args

    if (action === "list") {
      if (!existsSync(SESSION_DIR)) return "No session logs found"

      const files = readdirSync(SESSION_DIR)
        .filter((f) => f.endsWith(".jsonl"))
        .sort()
        .reverse()
        .slice(0, limit)

      if (files.length === 0) return "No session logs found"

      return [
        "Session logs:",
        ...files.map((f) => {
          const date = f.replace(".jsonl", "")
          const path = join(SESSION_DIR, f)
          try {
            const content = readFileSync(path, "utf-8").trim()
            const lines = content.split("\n").length
            return `  ${date} (${lines} entries)`
          } catch {
            return `  ${date} (unreadable)`
          }
        }),
      ].join("\n")
    }

    if (action === "search") {
      if (!query) return "Provide a search query"
      if (!existsSync(SESSION_DIR)) return "No session logs found"

      const results: string[] = []
      const files = readdirSync(SESSION_DIR).filter((f) => f.endsWith(".jsonl"))

      for (const file of files) {
        if (results.length >= limit) break
        try {
          const content = readFileSync(join(SESSION_DIR, file), "utf-8")
          const lines = content.split("\n")
          for (const line of lines) {
            if (line.toLowerCase().includes(query.toLowerCase())) {
              const entry = JSON.parse(line)
              results.push(
                `${file}: [${entry.outcome}] ${entry.textLength ?? 0} chars (${entry.timestamp})`
              )
              break
            }
          }
        } catch {}
      }

      if (results.length === 0) return `No results for "${query}"`
      return [`Search results for "${query}":`, ...results].join("\n")
    }

    if (action === "read") {
      if (!query) return "Provide a date (YYYY-MM-DD) to read"
      const file = join(SESSION_DIR, `${query}.jsonl`)
      if (!existsSync(file)) return `No session log for ${query}`

      const content = readFileSync(file, "utf-8").trim()
      const entries = content.split("\n").map((line) => {
        try {
          const entry = JSON.parse(line)
          return `  [${entry.outcome}] ${entry.textLength ?? 0} chars - ${entry.timestamp}`
        } catch {
          return `  (unreadable entry)`
        }
      })

      return [`Session ${query} (${entries.length} entries):`, ...entries].join("\n")
    }

    return `Unknown action: ${action}. Use: list, search, or read`
  },
})
