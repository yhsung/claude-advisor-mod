import { loadConfig } from './config.js';
import { PlanningGate } from './gates/planning-gate.js';
import { ErrorLoopGate } from './gates/error-loop-gate.js';
import { PreFinishGate } from './gates/pre-finish-gate.js';
import { handleAdvisorCommand } from './commands/advisor-command.js';
export * from './types.js';
export * from './config.js';
export * from './providers/provider-interface.js';
export * from './providers/provider-factory.js';
export * from './pruner/context-pruner.js';
export * from './pruner/diff-extractor.js';
export * from './pruner/prompt-templates.js';
export * from './gates/gate-evaluator.js';
export * from './gates/planning-gate.js';
export * from './gates/error-loop-gate.js';
export * from './gates/pre-finish-gate.js';
export * from './commands/advisor-command.js';
/**
 * Hook handler for user prompt submission (Planning Gate)
 */
export async function onPrePrompt(payload) {
    const config = loadConfig();
    const gate = new PlanningGate(config);
    return gate.run(payload.prompt, payload.turns);
}
/**
 * Hook handler for tool execution output (Error Loop Gate)
 */
export async function onPostToolUse(payload) {
    const config = loadConfig();
    const gate = new ErrorLoopGate(config);
    return gate.run(payload.tool, payload.args || {}, payload.result || '', payload.userPrompt);
}
/**
 * Hook handler for session stop or pre-completion (Pre-Finish Gate)
 */
export async function onStop(payload) {
    const config = loadConfig();
    const gate = new PreFinishGate(config);
    return gate.run(payload.userPrompt || '', payload.turns);
}
/**
 * Command handler for /advisor slash command
 */
export async function onAdvisorCommand(args = []) {
    return handleAdvisorCommand(args);
}
/**
 * Standard Claude Code Mod Plugin Registration Middleware
 */
export function register(on) {
    on('PrePrompt', async (payload) => {
        return onPrePrompt(payload);
    });
    on('PostToolUse', async (payload) => {
        return onPostToolUse(payload);
    });
    on('Stop', async (payload) => {
        return onStop(payload);
    });
    on('Command:advisor', async (args) => {
        return onAdvisorCommand(args);
    });
}
export default {
    onPrePrompt,
    onPostToolUse,
    onStop,
    onAdvisorCommand,
    register,
};
//# sourceMappingURL=index.js.map