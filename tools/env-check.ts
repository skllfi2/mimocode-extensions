import { tool } from "@mimo-ai/plugin"

export default tool({
  description: "Check environment: verify tool availability, check PATH, test network connectivity",
  args: {
    action: tool.schema.string().describe("'tools' to check available tools, 'path' to list PATH entries, 'network' to test connectivity, 'node' to check Node.js info"),
    tool_name: tool.schema.string().optional().describe("Specific tool to check (e.g., 'git', 'docker', 'node')"),
  },
  async execute(args) {
    const { action, tool_name } = args
    const { execSync } = require("child_process")

    if (action === "tools") {
      const tools = ["git", "node", "npm", "bun", "docker", "python", "pip", "uv", "rg", "jq", "curl", "wget", "ssh", "gh"]
      const results: string[] = []

      for (const t of tools) {
        try {
          const path = execSync(`where ${t}`, { encoding: "utf-8", timeout: 2000 }).trim().split("\n")[0]
          results.push(`  ${t}: ${path}`)
        } catch {
          results.push(`  ${t}: NOT FOUND`)
        }
      }

      return ["Available tools:", ...results].join("\n")
    }

    if (action === "path") {
      const pathVar = process.env.PATH || ""
      const entries = pathVar.split(";").filter(Boolean)
      return [
        `PATH entries (${entries.length}):`,
        ...entries.map((p) => `  ${p}`),
      ].join("\n")
    }

    if (action === "network") {
      const targets = [
        { name: "GitHub", url: "https://github.com" },
        { name: "npm", url: "https://registry.npmjs.org" },
        { name: "OpenAI", url: "https://api.openai.com" },
      ]

      const results: string[] = []
      for (const target of targets) {
        try {
          const start = Date.now()
          execSync(`curl -s -o /dev/null -w "%{http_code}" ${target.url}`, {
            encoding: "utf-8",
            timeout: 5000,
          })
          const ms = Date.now() - start
          results.push(`  ${target.name}: OK (${ms}ms)`)
        } catch {
          results.push(`  ${target.name}: UNREACHABLE`)
        }
      }

      return ["Network connectivity:", ...results].join("\n")
    }

    if (action === "node") {
      try {
        const nodeVersion = execSync("node --version", { encoding: "utf-8" }).trim()
        const npmVersion = execSync("npm --version", { encoding: "utf-8" }).trim()
        const bunVersion = execSync("bun --version 2>nul", { encoding: "utf-8" }).trim() || "not installed"

        return [
          "Runtime versions:",
          `  Node.js: ${nodeVersion}`,
          `  npm: ${npmVersion}`,
          `  bun: ${bunVersion}`,
        ].join("\n")
      } catch (e: any) {
        return `Error: ${e.message}`
      }
    }

    return `Unknown action: ${action}. Use: tools, path, network, or node`
  },
})
