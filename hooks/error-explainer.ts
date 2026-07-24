import type { Hooks } from "@mimo-ai/plugin"

const COMMON_ERRORS: Record<string, string> = {
  "ECONNREFUSED": "Server not running. Start it first.",
  "ENOENT": "File or directory not found. Check the path.",
  "EACCES": "Permission denied. Check file permissions.",
  "ENOMEM": "Out of memory. Possible memory leak.",
  "ETIMEDOUT": "Connection timed out. Check network.",
  "EADDRINUSE": "Port already in use. Change the port.",
  "MODULE_NOT_FOUND": "Module not found. Run: npm install",
  "SYNTAX_ERROR": "Syntax error. Check your code.",
  "TypeError": "Type error. Check your types.",
  "ReferenceError": "Undefined variable. Check your references.",
}

export default {
  "tool.execute.after": async (input, output) => {
    if (input.tool !== "bash") return

    const result = output.output ?? ""
    if (!result.includes("Error") && !result.includes("error")) return

    const suggestions: string[] = []

    for (const [code, explanation] of Object.entries(COMMON_ERRORS)) {
      if (result.includes(code)) {
        suggestions.push(`${code}: ${explanation}`)
      }
    }

    if (suggestions.length > 0) {
      output.output = result + "\n\n💡 Suggestions:\n" + suggestions.join("\n")
    }
  },
} satisfies Hooks
