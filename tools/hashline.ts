import { tool } from "@mimo-ai/plugin"
import { readFileSync } from "fs"

const HASH_CHARS = "ZPMQVRWSNKTXJBYH"

function hashLine(line: string, lineNum: number): string {
  let hash = lineNum
  for (let i = 0; i < line.length; i++) {
    hash = ((hash << 5) - hash + line.charCodeAt(i)) | 0
  }
  return HASH_CHARS[Math.abs(hash) % HASH_CHARS.length] +
         HASH_CHARS[Math.abs(hash >> 4) % HASH_CHARS.length]
}

function addHashes(content: string): string {
  return content.split("\n").map((line, i) => {
    const lineNum = i + 1
    const id = String(lineNum).padStart(2, "0") + "#" + hashLine(line, lineNum)
    return `${id}| ${line}`
  }).join("\n")
}

export default tool({
  description: "Read a file with LINE#ID content hashes for safe editing. Each line gets a hash tag (e.g., 11#VK) that validates content before edits.",
  args: {
    file_path: tool.schema.string().describe("Absolute path to the file"),
  },
  async execute(args) {
    try {
      const content = readFileSync(args.file_path, "utf-8")
      return addHashes(content)
    } catch (e: any) {
      return `Error reading file: ${e.message}`
    }
  },
})
