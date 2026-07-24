import { tool } from "@mimo-ai/plugin"

export default tool({
  description: "Transform text: case conversion, slug generation, word count, markdown to plain text, etc.",
  args: {
    text: tool.schema.string().describe("Text to transform"),
    action: tool.schema.string().describe("'upper', 'lower', 'title', 'slug', 'count', 'strip-md', 'reverse', 'truncate'"),
    max_length: tool.schema.number().optional().describe("Max length for truncate action"),
  },
  async execute(args) {
    const { text, action, max_length = 100 } = args

    switch (action) {
      case "upper":
        return text.toUpperCase()

      case "lower":
        return text.toLowerCase()

      case "title":
        return text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())

      case "slug":
        return text
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_]+/g, "-")
          .replace(/^-+|-+$/g, "")

      case "count": {
        const words = text.trim().split(/\s+/).filter(Boolean).length
        const chars = text.length
        const lines = text.split("\n").length
        const sentences = text.split(/[.!?]+/).filter((s) => s.trim()).length
        return [
          `Words: ${words}`,
          `Characters: ${chars}`,
          `Lines: ${lines}`,
          `Sentences: sentences`,
        ].join("\n")
      }

      case "strip-md":
        return text
          .replace(/#{1,6}\s/g, "")
          .replace(/\*\*(.+?)\*\*/g, "$1")
          .replace(/\*(.+?)\*/g, "$1")
          .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, ""))
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .replace(/!\[([^\]]*)\]\([^)]+\)/g, "[$1]")
          .replace(/^[-*]\s/gm, "")
          .replace(/^\d+\.\s/gm, "")
          .trim()

      case "reverse":
        return text.split("").reverse().join("")

      case "truncate":
        if (text.length <= max_length) return text
        return text.slice(0, max_length - 3) + "..."

      default:
        return `Unknown action: ${action}. Use: upper, lower, title, slug, count, strip-md, reverse, truncate`
    }
  },
})
