import { tool } from "@mimo-ai/plugin"
import { randomUUID, randomBytes } from "crypto"

export default tool({
  description: "Generate UUIDs (v4) or random tokens in various formats",
  args: {
    format: tool.schema.string().optional().describe("Output format: 'uuid' (default), 'short', 'hex', 'base64'"),
    count: tool.schema.number().optional().describe("Number of IDs to generate (default: 1)"),
  },
  async execute(args) {
    const { format = "uuid", count = 1 } = args
    const results: string[] = []

    for (let i = 0; i < Math.min(count, 50); i++) {
      switch (format) {
        case "uuid":
          results.push(randomUUID())
          break
        case "short":
          results.push(randomBytes(8).toString("hex"))
          break
        case "hex":
          results.push(randomBytes(16).toString("hex"))
          break
        case "base64":
          results.push(randomBytes(16).toString("base64url"))
          break
        default:
          return `Unknown format: ${format}. Use: uuid, short, hex, base64`
      }
    }

    return results.join("\n")
  },
})
