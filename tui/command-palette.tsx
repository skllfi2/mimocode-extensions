// TUI Plugin: Command Palette
// Quick access to common operations via keyboard shortcuts
// Requires MiMoCode TUI restart to load

export default {
  name: "command-palette",
  description: "Quick command palette for common operations",

  commands: [
    {
      name: "extensions",
      description: "List all active extensions",
      handler: () => {
        return [
          "Active Extensions:",
          "",
          "Hooks (7): comment-checker, rules-injector, write-existing-file-guard,",
          "         intent-gate, todo-enforcer, dangerous-command-guard, session-tracker,",
          "         auto-test, error-explainer",
          "",
          "Skills (11): project-context, security-audit, git-master, frontend-design,",
          "            database, mcp-setup, ultrawork, code-review, api-design,",
          "            init-deep, tmux-mastery, debugging",
          "",
          "Tools (10): weather, hashline, json-query, color-convert, uuid-gen,",
          "           git-smart, file-hash, time-utils, text-transform, env-check",
        ].join("\n")
      },
    },
    {
      name: "quick-audit",
      description: "Run quick project audit",
      handler: () => "Run workflow: full-audit",
    },
    {
      name: "setup",
      description: "Show setup instructions",
      handler: () => [
        "MiMoCode Extensions Setup:",
        "",
        "1. Clone: git clone https://github.com/skllfi2/mimocode-extensions.git",
        "2. Install: bash install.sh",
        "3. Restart MiMoCode",
        "",
        "Extensions auto-load on next turn.",
      ].join("\n"),
    },
  ],
}
