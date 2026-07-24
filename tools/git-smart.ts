import { tool } from "@mimo-ai/plugin"

export default tool({
  description: "Smart git operations: find stale branches, generate changelog, show contribution stats",
  args: {
    action: tool.schema.string().describe("'stale' to find old branches, 'changelog' for changelog, 'stats' for contribution stats"),
    days: tool.schema.number().optional().describe("Days threshold for stale branches (default: 14)"),
  },
  async execute(args) {
    const { action, days = 14 } = args

    if (action === "stale") {
      try {
        const { execSync } = require("child_process")
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        const cutoffStr = cutoff.toISOString().split("T")[0]

        const output = execSync(
          `git log --since="${cutoffStr}" --format="%H" --all | head -1`,
          { encoding: "utf-8", timeout: 5000 }
        ).trim()

        if (!output) return "No commits found in the last " + days + " days"

        const branches = execSync(
          `git for-each-ref --format="%(refname:short) %(committerdate:iso8601)" refs/heads/`,
          { encoding: "utf-8", timeout: 5000 }
        ).trim().split("\n").filter(Boolean)

        const stale = branches.filter((line: string) => {
          const date = line.split(" ")[1]
          return date < cutoffStr
        })

        if (stale.length === 0) return `No branches older than ${days} days`

        return [
          `Stale branches (older than ${days} days):`,
          ...stale.map((b: string) => `  ${b}`),
          "",
          `Total: ${stale.length} stale branches`,
        ].join("\n")
      } catch (e: any) {
        return `Error: ${e.message}`
      }
    }

    if (action === "changelog") {
      try {
        const { execSync } = require("child_process")
        const log = execSync(
          'git log --oneline --no-merges -50 --format="- %s (%h)"',
          { encoding: "utf-8", timeout: 5000 }
        ).trim()

        const commits = log.split("\n").filter(Boolean)
        const groups: Record<string, string[]> = {
          feat: [], fix: [], docs: [], refactor: [], chore: [], other: [],
        }

        for (const commit of commits) {
          const match = commit.match(/^- (feat|fix|docs|refactor|chore|perf|test|ci|build)(?:\(.+?\))?:/i)
          const type = match ? match[1].toLowerCase() : "other"
          const key = groups[type] ? type : "other"
          groups[key].push(commit)
        }

        const lines: string[] = ["# Changelog\n"]
        for (const [type, items] of Object.entries(groups)) {
          if (items.length > 0) {
            lines.push(`## ${type.charAt(0).toUpperCase() + type.slice(1)}`)
            lines.push(...items)
            lines.push("")
          }
        }

        return lines.join("\n")
      } catch (e: any) {
        return `Error: ${e.message}`
      }
    }

    if (action === "stats") {
      try {
        const { execSync } = require("child_process")

        const totalCommits = execSync("git rev-list --count HEAD", { encoding: "utf-8" }).trim()
        const totalAuthors = execSync("git shortlog -sn --all | wc -l", { encoding: "utf-8" }).trim()
        const firstCommit = execSync("git log --reverse --format=%ai -1", { encoding: "utf-8" }).trim()
        const lastCommit = execSync("git log --format=%ai -1", { encoding: "utf-8" }).trim()
        const files = execSync("git ls-files | wc -l", { encoding: "utf-8" }).trim()

        const topAuthors = execSync("git shortlog -sn --all | head -5", { encoding: "utf-8" }).trim()

        return [
          "# Repository Stats",
          "",
          `Total commits: ${totalCommits}`,
          `Contributors: ${totalAuthors}`,
          `Tracked files: ${files}`,
          `First commit: ${firstCommit}`,
          `Last commit: ${lastCommit}`,
          "",
          "Top authors:",
          topAuthors,
        ].join("\n")
      } catch (e: any) {
        return `Error: ${e.message}`
      }
    }

    return `Unknown action: ${action}. Use: stale, changelog, or stats`
  },
})
