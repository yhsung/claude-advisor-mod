---
description: Query, toggle, or select models for the Claude Advisor watchdog
---

## Advisor-Mod Command Execution

Arguments provided: `$ARGUMENTS`

Use the `advisor_status` tool or `consult_advisor` tool to inspect or query the advisor watchdog.
If the argument is `status`, display the current advisor metrics and mode.
If the argument is `model` (with or without arguments), inspect or update the advisor model selection.
If the argument is `mode <advisory|balanced|strict|disabled>`, update the advisor intervention mode.
If the argument is `test`, call `consult_advisor` with a diagnostic question to verify connectivity.
