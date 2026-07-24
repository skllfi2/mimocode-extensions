// TUI Plugin: Status Panel
// Shows active hooks, skills, and session stats in a sidebar panel
// Requires MiMoCode TUI restart to load

export default {
  name: "status-panel",
  description: "Shows active extensions and session statistics",

  panel: {
    position: "sidebar",
    title: "MiMo Extensions",

    render: () => {
      // This would be rendered by the MiMoCode TUI runtime
      // Actual rendering depends on the TUI framework
      return {
        sections: [
          {
            title: "Active Hooks",
            items: [
              "comment-checker",
              "rules-injector", 
              "write-existing-file-guard",
              "intent-gate",
              "todo-enforcer",
              "dangerous-command-guard",
              "session-tracker",
            ],
          },
          {
            title: "Skills",
            items: [
              "project-context",
              "security-audit",
              "git-master",
              "frontend-design",
              "database",
              "mcp-setup",
              "ultrawork",
            ],
          },
          {
            title: "Tools",
            items: [
              "weather",
              "hashline",
              "json-query",
              "color-convert",
              "uuid-gen",
              "portable-pack",
            ],
          },
        ],
      }
    },
  },

  commands: [
    {
      name: "extensions",
      description: "List all active extensions",
      handler: () => "See status panel",
    },
  ],
}
