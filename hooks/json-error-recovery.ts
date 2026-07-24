import type { Hooks } from "@mimo-ai/plugin"

export default {
  "tool.execute.after": async (input, output) => {
    const result = output.output ?? ""

    const jsonErrors = [
      "JSON.parse",
      "Unexpected token",
      "Unexpected end of JSON",
      "SyntaxError",
      "json parse error",
      "invalid json",
    ]

    const isJsonError = jsonErrors.some((e) => result.toLowerCase().includes(e.toLowerCase()))
    if (!isJsonError) return

    output.output = result +
      "\n\n[JsonErrorRecovery] JSON parsing failed. The response may contain markdown or other non-JSON content. " +
      "Try asking for the response to be formatted as valid JSON, or extract the JSON portion manually."
  },
} satisfies Hooks
