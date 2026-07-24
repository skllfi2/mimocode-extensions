import { tool } from "@mimo-ai/plugin"
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync } from "fs"
import { join, relative, basename } from "path"
import { gzipSync, gunzipSync } from "zlib"

const PACK_DIRS = ["hooks", "rules", "skills", "workflows", "tui"]
const CONFIG_FILE = "mimocode-pack.json"

function listFiles(dir: string, base: string = dir): string[] {
  if (!existsSync(dir)) return []
  const results: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      results.push(...listFiles(full, base))
    } else if (!entry.endsWith(".json") || entry === CONFIG_FILE) {
      results.push(relative(base, full))
    }
  }
  return results
}

export default tool({
  description: "Pack/unpack .mimocode extensions for transfer to another PC. Creates a portable .tar.gz or extracts one.",
  args: {
    action: tool.schema.string().describe("'pack' to create archive, 'unpack' to extract, 'list' to show contents"),
    archive: tool.schema.string().optional().describe("Archive path (default: mimocode-portable.tar.gz)"),
    source: tool.schema.string().optional().describe("Source directory to pack (default: .mimocode)"),
  },
  async execute(args) {
    const { action, archive = "mimocode-portable.tar.gz", source = ".mimocode" } = args

    if (action === "list") {
      if (!existsSync(archive)) return `Archive not found: ${archive}`
      try {
        const buf = readFileSync(archive)
        const text = gunzipSync(buf).toString("utf-8")
        const manifest = JSON.parse(text)
        return [
          `Archive: ${archive}`,
          `Created: ${manifest.created}`,
          `Files: ${manifest.files.length}`,
          "",
          ...manifest.files.map((f: any) => `  ${f.path} (${f.size} bytes)`),
        ].join("\n")
      } catch {
        return "Invalid archive or not a mimocode pack"
      }
    }

    if (action === "pack") {
      const files: { path: string; content: string; size: number }[] = []

      for (const dir of PACK_DIRS) {
        const dirPath = join(source, dir)
        for (const file of listFiles(dirPath)) {
          const fullPath = join(dirPath, file)
          try {
            const content = readFileSync(fullPath, "utf-8")
            files.push({
              path: `${dir}/${file}`,
              content,
              size: content.length,
            })
          } catch {}
        }
      }

      // Include root-level config
      for (const f of ["package.json"]) {
        const p = join(source, f)
        if (existsSync(p)) {
          files.push({
            path: f,
            content: readFileSync(p, "utf-8"),
            size: statSync(p).size,
          })
        }
      }

      const manifest = {
        version: "1.0",
        created: new Date().toISOString(),
        source: process.env.HOME || process.env.USERPROFILE || "unknown",
        files,
      }

      const json = JSON.stringify(manifest, null, 2)
      const compressed = gzipSync(Buffer.from(json))
      writeFileSync(archive, compressed)

      const totalSize = files.reduce((s, f) => s + f.size, 0)
      return [
        `Packed ${files.length} files (${totalSize} bytes) → ${archive}`,
        `Archive size: ${(compressed.length / 1024).toFixed(1)} KB`,
        "",
        "To install on another PC:",
        `  1. Copy ${archive} to the target machine`,
        `  2. Place it in the project root`,
        `  3. Run: mimocode unpack ${archive}`,
      ].join("\n")
    }

    if (action === "unpack") {
      if (!existsSync(archive)) return `Archive not found: ${archive}`

      try {
        const buf = readFileSync(archive)
        const text = gunzipSync(buf).toString("utf-8")
        const manifest = JSON.parse(text)

        if (!manifest.files || !Array.isArray(manifest.files)) {
          return "Invalid pack format"
        }

        let written = 0
        for (const file of manifest.files) {
          const targetPath = join(source, file.path)
          const dir = targetPath.substring(0, targetPath.lastIndexOf("\\") || targetPath.lastIndexOf("/"))
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
          writeFileSync(targetPath, file.content, "utf-8")
          written++
        }

        return `Unpacked ${written} files from ${archive} into ${source}/`
      } catch (e: any) {
        return `Error unpacking: ${e.message}`
      }
    }

    return `Unknown action: ${action}. Use: pack, unpack, or list`
  },
})
