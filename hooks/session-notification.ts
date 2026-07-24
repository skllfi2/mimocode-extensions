import type { Hooks } from "@mimo-ai/plugin"
import { execSync } from "child_process"
import { platform } from "os"

function sendNotification(title: string, message: string) {
  const os = platform()

  try {
    if (os === "win32") {
      execSync(
        `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; $n = New-Object System.Windows.Forms.NotifyIcon; $n.Icon = [System.Drawing.SystemIcons]::Information; $n.Visible = $true; $n.ShowBalloonTip(5000, '${title.replace(/'/g, "''")}', '${message.replace(/'/g, "''")}', [System.Windows.Forms.ToolTipIcon]::Info)"`,
        { timeout: 5000, stdio: "ignore" }
      )
    } else if (os === "darwin") {
      execSync(
        `osascript -e 'display notification "${message.replace(/"/g, '\\"')}" with title "${title.replace(/"/g, '\\"')}"'`,
        { timeout: 5000, stdio: "ignore" }
      )
    } else {
      execSync(
        `notify-send "${title}" "${message}"`,
        { timeout: 5000, stdio: "ignore" }
      )
    }
  } catch {}
}

export default {
  "session.post": async (input, output) => {
    const outcome = input.outcome
    const title = "MiMoCode"
    let message = ""

    if (outcome === "completed") {
      message = "Session completed successfully"
    } else if (outcome === "error") {
      message = `Session error: ${input.error ?? "unknown"}`
    } else if (outcome === "cancelled") {
      message = "Session cancelled"
    }

    if (message) {
      sendNotification(title, message)
    }
  },
} satisfies Hooks
