import type { Hooks } from "@mimo-ai/plugin"

const BLOCKED_PATTERNS = [
  { pattern: /rm\s+-rf\s+[\/~]/, reason: "Recursive delete on root/home — extremely dangerous" },
  { pattern: /rm\s+-rf\s+\*/, reason: "Recursive delete with wildcard" },
  { pattern: />\s*\/dev\/sd[a-z]/, reason: "Direct write to disk device" },
  { pattern: /mkfs\./, reason: "Format disk — destructive operation" },
  { pattern: /dd\s+if=.*of=\/dev\//, reason: "Direct disk write with dd" },
  { pattern: /:\(\)\{\s*:\|:&\s*\};:/, reason: "Fork bomb detected" },
  { pattern: /chmod\s+-R\s+777\s+\//, reason: "Setting world-writable on root" },
  { pattern: /curl\s+.*\|\s*(ba)?sh/, reason: "Piping remote script to shell" },
  { pattern: /wget\s+.*\|\s*(ba)?sh/, reason: "Piping remote script to shell" },
  { pattern: /git\s+push\s+--force/, reason: "Force push — can destroy shared history" },
  { pattern: /git\s+reset\s+--hard/, reason: "Hard reset — discards all uncommitted changes" },
]

export default {
  "tool.execute.before": async (input, output) => {
    if (input.tool !== "bash") return

    const cmd = output.args?.command ?? ""

    for (const { pattern, reason } of BLOCKED_PATTERNS) {
      if (pattern.test(cmd)) {
        output.cancel = true
        output.cancelReason = `BLOCKED: ${reason}. If you really need this, remove the dangerous-command-guard hook.`
        return
      }
    }
  },
} satisfies Hooks
