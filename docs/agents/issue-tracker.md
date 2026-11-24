# Issue tracker: Aven

Tasks for this repo live in Aven. Run commands from this repository so Aven can infer the workspace and project. Use the `aven` CLI to find, inspect, and update tasks.

## Conventions

- **Find ready work**: `aven list --ready`
- **Search tasks**: `aven search "query"`
- **Inspect a task**: `aven context <ref>` for full context; `aven show <ref>` for a status check.
- **Update status or details**: `aven edit <ref> --status <status>` and `aven edit <ref> --title "..."`
- **Leave durable handoff context**: `aven note <ref> --stdin` with a concise summary.
- Use refs printed by Aven, preferably qualified refs such as `APP-7KQ9`.
- Follow the Aven skill instructions for dependencies, relationships, projects, and other task operations.
