#!/usr/bin/env node
import fs from 'node:fs';
import { loadConfig } from '../config.js';
import { PlanningGate } from '../gates/planning-gate.js';
import { ErrorLoopGate } from '../gates/error-loop-gate.js';
import { PreFinishGate } from '../gates/pre-finish-gate.js';
async function main() {
    const eventFromArg = process.argv[2];
    let rawInput = '';
    try {
        rawInput = fs.readFileSync(0, 'utf-8');
    }
    catch {
        // stdin empty
    }
    let data = {};
    if (rawInput.trim()) {
        try {
            data = JSON.parse(rawInput);
        }
        catch {
            // ignore parse error
        }
    }
    const hookEvent = eventFromArg || data.hook_event_name || data.hookEventName || '';
    const config = loadConfig();
    if (config.mode === 'disabled') {
        process.exit(0);
    }
    if (hookEvent === 'UserPromptSubmit' || hookEvent === 'PrePrompt') {
        const prompt = data.user_prompt || data.prompt || data.message || '';
        if (!prompt) {
            process.exit(0);
        }
        const gate = new PlanningGate(config);
        const result = await gate.run(prompt);
        if (result.injectedContext) {
            const output = {
                hookSpecificOutput: {
                    hookEventName: 'UserPromptSubmit',
                    additionalContext: result.injectedContext,
                },
            };
            console.log(JSON.stringify(output));
        }
        process.exit(0);
    }
    if (hookEvent === 'PostToolUse') {
        const toolName = data.tool_name || data.tool || '';
        const toolArgs = data.tool_input || data.tool_args || data.args || {};
        const toolResult = typeof data.tool_result === 'string'
            ? data.tool_result
            : typeof data.tool_output === 'string'
                ? data.tool_output
                : JSON.stringify(data.tool_result || data.tool_output || '');
        const userPrompt = data.user_prompt || data.prompt;
        const gate = new ErrorLoopGate(config);
        const result = await gate.run(toolName, toolArgs, toolResult, userPrompt);
        if (result.injectedContext) {
            if (config.mode === 'strict' && !result.continue) {
                console.error(result.message);
                process.exit(2); // Block execution in Claude Code
            }
            const output = {
                hookSpecificOutput: {
                    hookEventName: 'PostToolUse',
                    additionalContext: result.injectedContext,
                },
            };
            console.log(JSON.stringify(output));
        }
        process.exit(0);
    }
    if (hookEvent === 'Stop') {
        const prompt = data.user_prompt || data.prompt || '';
        const gate = new PreFinishGate(config);
        const result = await gate.run(prompt);
        if (result.injectedContext) {
            if (config.mode === 'strict' && !result.continue) {
                console.error(result.message);
                process.exit(2);
            }
            const output = {
                hookSpecificOutput: {
                    hookEventName: 'Stop',
                    additionalContext: result.injectedContext,
                },
            };
            console.log(JSON.stringify(output));
        }
        process.exit(0);
    }
    process.exit(0);
}
main().catch((err) => {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[advisor-hook] Error: ${msg}`);
    process.exit(0); // Fail-open to avoid disrupting Claude Code
});
//# sourceMappingURL=cli-hook.js.map