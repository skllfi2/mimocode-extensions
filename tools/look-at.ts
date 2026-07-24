import { tool } from "@mimo-ai/plugin"
import { readFileSync, existsSync } from "fs"

export default tool({
  description: "Analyze an image or file visually. Provides detailed description of the content.",
  args: {
    file_path: tool.schema.string().describe("Path to the image or file to analyze"),
    question: tool.schema.string().optional().describe("Specific question about the content"),
  },
  async execute(args) {
    const { file_path, question } = args

    if (!existsSync(file_path)) return `File not found: ${file_path}`

    try {
      const content = readFileSync(file_path)

      const ext = file_path.split(".").pop()?.toLowerCase() ?? ""
      const imageExts = ["png", "jpg", "jpeg", "gif", "webp", "bmp", "svg"]
      const textExts = ["txt", "md", "json", "js", "ts", "py", "java", "cpp", "c", "h", "rs", "go"]
      const configExts = ["yaml", "yml", "toml", "ini", "env"]

      if (imageExts.includes(ext)) {
        return [
          `Image: ${file_path}`,
          `Format: ${ext.toUpperCase()}`,
          `Size: ${content.length} bytes`,
          "",
          "Note: I can see this is an image file. To analyze its visual content,",
          "please describe what you'd like me to look for, or use a vision-capable model.",
        ].join("\n")
      }

      if (textExts.includes(ext) || configExts.includes(ext)) {
        const text = content.toString("utf-8")
        const lines = text.split("\n")
        const nonEmpty = lines.filter((l) => l.trim()).length

        let summary = `File: ${file_path}\n`
        summary += `Format: .${ext}\n`
        summary += `Lines: ${lines.length} (${nonEmpty} non-empty)\n`
        summary += `Size: ${content.length} bytes\n`

        if (question) {
          summary += `\nQuestion: ${question}\n`
          summary += `\nTo answer your question, please read the file with the read tool.`
        } else {
          summary += `\nFirst 20 lines:\n`
          summary += lines.slice(0, 20).join("\n")
        }

        return summary
      }

      return `File: ${file_path}\nType: ${ext}\nSize: ${content.length} bytes\nBinary file detected.`
    } catch (e: any) {
      return `Error: ${e.message}`
    }
  },
})
