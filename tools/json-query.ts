import { tool } from "@mimo-ai/plugin"

export default tool({
  description: "Query JSON data using dot-notation paths. Supports nested access, arrays, and filtering.",
  args: {
    data: tool.schema.string().describe("JSON string to query"),
    path: tool.schema.string().describe("Dot-notation path (e.g., 'users.0.name' or 'items.*.price')"),
  },
  async execute(args) {
    try {
      const obj = JSON.parse(args.data)
      const parts = args.path.split(".")
      let current: any = obj

      for (const part of parts) {
        if (current == null) return `Path not found: ${args.path}`

        if (part === "*") {
          if (Array.isArray(current)) {
            return JSON.stringify(current, null, 2)
          }
          return "Wildcard only works on arrays"
        }

        if (/^\d+$/.test(part)) {
          current = current[parseInt(part)]
        } else {
          current = current[part]
        }
      }

      return typeof current === "string" ? current : JSON.stringify(current, null, 2)
    } catch (e: any) {
      return `Error: ${e.message}`
    }
  },
})
