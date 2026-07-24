import { tool } from "@mimo-ai/plugin"

function hexToRgb(hex: string): [number, number, number] | null {
  const m = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i)
  if (!m) return null
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, Math.round(l * 100)]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

export default tool({
  description: "Convert colors between HEX, RGB, and HSL formats",
  args: {
    color: tool.schema.string().describe("Color value (e.g., '#FF5733', 'rgb(255,87,51)', 'hsl(14,100%,60%)')"),
    format: tool.schema.string().optional().describe("Target format: 'hex', 'rgb', or 'hsl' (default: all three)"),
  },
  async execute(args) {
    let r: number, g: number, b: number
    const input = args.color.trim()

    // Parse input
    const hexMatch = input.match(/^#?([a-f\d]{6})$/i)
    if (hexMatch) {
      const rgb = hexToRgb(hexMatch[1])
      if (!rgb) return "Invalid hex color"
      ;[r, g, b] = rgb
    } else {
      const rgbMatch = input.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i)
      if (rgbMatch) {
        ;[, r, g, b] = rgbMatch.map(Number)
      } else {
        return "Unsupported format. Use: #FF5733 or rgb(255,87,51)"
      }
    }

    const [h, s, l] = rgbToHsl(r, g, b)
    const hex = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`.toUpperCase()

    const results = [
      `HEX: ${hex}`,
      `RGB: rgb(${r}, ${g}, ${b})`,
      `HSL: hsl(${h}, ${s}%, ${l}%)`,
    ]

    if (args.format) {
      const f = args.format.toLowerCase()
      if (f === "hex") return results[0]
      if (f === "rgb") return results[1]
      if (f === "hsl") return results[2]
    }

    return results.join("\n")
  },
})
