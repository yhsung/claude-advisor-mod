---
description: Query, toggle, or configure the Claude Advisor model and watchdog
---

## Advisor Command Execution

Arguments provided: `$ARGUMENTS`

Use the `advisor_status` tool or `consult_advisor` tool to inspect or query the advisor watchdog.
If the argument is `status`, display the current advisor metrics and mode.
If the argument is `mode <advisory|balanced|strict|disabled>`, instruct the user or update `~/.claude/advisor.json`.
If the argument is `test`, call `consult_advisor` with a diagnostic question to verify connectivity.
