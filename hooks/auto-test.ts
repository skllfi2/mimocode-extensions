import type { Hooks } from "@mimo-ai/plugin"

const TEST_COMMANDS: Record<string, string> = {
  ".ts": "npx tsc --noEmit",
  ".js": "node --check",
  ".tsx": "npx tsc --noEmit",
  ".jsx": "node --check",
  ".py": "python -m py_compile",
  ".go": "go vet",
  ".rs": "cargo check",
}

export default {
  "tool.execute.after": async (input, output) => {
    if (input.tool !== "write" && input.tool !== "edit") return

    const filePath = input.args?.file_path ?? output.args?.file_path ?? ""
    const ext = "." + filePath.split(".").pop()

    const testCmd = TEST_COMMANDS[ext]
    if (!testCmd) return

    output.metadata = {
      ...output.metadata,
      autoTest: {
        command: `${testCmd} ${filePath}`,
        suggestion: `Run "${testCmd} ${filePath}" to verify syntax`,
      },
    }
  },
} satisfies Hooks
