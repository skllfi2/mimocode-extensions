import { tool } from "@mimo-ai/plugin"

export default tool({
  description: "Time utilities: convert timestamps, calculate durations, get timezone info",
  args: {
    action: tool.schema.string().describe("'now' for current time, 'convert' to convert timestamp, 'diff' to calculate duration between timestamps"),
    timestamp: tool.schema.string().optional().describe("ISO timestamp or unix seconds for convert/diff"),
    timestamp2: tool.schema.string().optional().describe("Second timestamp for diff calculation"),
    timezone: tool.schema.string().optional().describe("Target timezone (e.g., 'America/New_York', 'UTC+3')"),
  },
  async execute(args) {
    const { action, timestamp, timestamp2, timezone } = args

    if (action === "now") {
      const now = new Date()
      const tz = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone

      try {
        const formatted = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          dateStyle: "full",
          timeStyle: "long",
        }).format(now)

        return [
          `Current time (${tz}):`,
          formatted,
          "",
          `Unix: ${Math.floor(now.getTime() / 1000)}`,
          `ISO: ${now.toISOString()}`,
        ].join("\n")
      } catch {
        return `Current time: ${now.toISOString()}`
      }
    }

    if (action === "convert") {
      if (!timestamp) return "Provide a timestamp to convert"

      const date = /^\d+$/.test(timestamp)
        ? new Date(parseInt(timestamp) * 1000)
        : new Date(timestamp)

      if (isNaN(date.getTime())) return `Invalid timestamp: ${timestamp}`

      const tz = timezone || "UTC"
      try {
        const formatted = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          dateStyle: "full",
          timeStyle: "long",
        }).format(date)

        return [
          `Converted to ${tz}:`,
          formatted,
          "",
          `Unix: ${Math.floor(date.getTime() / 1000)}`,
          `ISO: ${date.toISOString()}`,
        ].join("\n")
      } catch {
        return date.toISOString()
      }
    }

    if (action === "diff") {
      if (!timestamp || !timestamp2) return "Provide two timestamps for diff"

      const d1 = /^\d+$/.test(timestamp) ? new Date(parseInt(timestamp) * 1000) : new Date(timestamp)
      const d2 = /^\d+$/.test(timestamp2) ? new Date(parseInt(timestamp2) * 1000) : new Date(timestamp2)

      if (isNaN(d1.getTime())) return `Invalid timestamp: ${timestamp}`
      if (isNaN(d2.getTime())) return `Invalid timestamp: ${timestamp2}`

      const diffMs = Math.abs(d2.getTime() - d1.getTime())
      const days = Math.floor(diffMs / 86400000)
      const hours = Math.floor((diffMs % 86400000) / 3600000)
      const minutes = Math.floor((diffMs % 3600000) / 60000)
      const seconds = Math.floor((diffMs % 60000) / 1000)

      return [
        `Time difference:`,
        `${days}d ${hours}h ${minutes}m ${seconds}s`,
        `(${diffMs.toLocaleString()} milliseconds)`,
      ].join("\n")
    }

    return `Unknown action: ${action}. Use: now, convert, or diff`
  },
})
