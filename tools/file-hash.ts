import { tool } from "@mimo-ai/plugin"
import { readFileSync, existsSync } from "fs"
import { createHash } from "crypto"

export default tool({
  description: "Compute file hashes (MD5, SHA1, SHA256) or verify file integrity",
  args: {
    file_path: tool.schema.string().describe("Path to the file"),
    algorithm: tool.schema.string().optional().describe("Hash algorithm: 'md5', 'sha1', 'sha256' (default: all three)"),
  },
  async execute(args) {
    const { file_path, algorithm } = args

    if (!existsSync(file_path)) return `File not found: ${file_path}`

    try {
      const content = readFileSync(file_path)
      const algorithms = algorithm ? [algorithm] : ["md5", "sha1", "sha256"]

      const results = algorithms.map((algo) => {
        const hash = createHash(algo).update(content).digest("hex")
        return `${algo.toUpperCase()}: ${hash}`
      })

      return [
        `File: ${file_path}`,
        `Size: ${content.length} bytes`,
        "",
        ...results,
      ].join("\n")
    } catch (e: any) {
      return `Error: ${e.message}`
    }
  },
})
