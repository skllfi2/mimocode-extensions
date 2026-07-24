import type { Hooks } from "@mimo-ai/plugin"

const AI_SLOP_WORDS = [
  /\b(clearly|obviously|simply|obvious|trivial)\b/gi,
  /\b(furthermore|moreover|additionally|in addition)\b/gi,
  /\b(note that|it's worth noting|it is worth noting)\b/gi,
  /\b(utilize|leveraged?|leverage)\b/gi,
  /\b(seamlessly|robust|robustly)\b/gi,
  /\b(comprehensive|holistic|end-to-end)\b/gi,
  /\b(powerful|cutting-edge|state-of-the-art)\b/gi,
  /\b(rather|essentially|basically)\b/gi,
  /\b(significantly|substantially)\b/gi,
  /\b(implement|implementing|implementation)\b/gi,
  /\b(consequently|therefore)\b/gi,
]

const EM_DASH = /—/g
const EN_DASH = /–/g

function checkText(text: string): string[] {
  const issues: string[] = []

  for (const pattern of AI_SLOP_WORDS) {
    const matches = text.match(pattern)
    if (matches) {
      issues.push(`AI slop word: "${matches[0]}"`)
    }
  }

  if (EM_DASH.test(text)) {
    issues.push("Contains em dash (—) — use -- or - instead")
  }

  if (EN_DASH.test(text)) {
    issues.push("Contains en dash (–) — use -- or - instead")
  }

  return issues
}

export default {
  "tool.execute.after": async (input, output) => {
    if (input.tool !== "write" && input.tool !== "edit") return

    const content = output.output ?? ""
    const issues = checkText(content)

    if (issues.length > 0) {
      output.metadata = {
        ...output.metadata,
        commentChecker: {
          warnings: issues,
          suggestion: "Rewrite to remove AI slop words and special dashes",
        },
      }
    }
  },
} satisfies Hooks
