import { HookOutput } from './types.js';
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
export declare function onPrePrompt(payload: {
    prompt: string;
    turns?: any[];
}): Promise<HookOutput>;
/**
 * Hook handler for tool execution output (Error Loop Gate)
 */
export declare function onPostToolUse(payload: {
    tool: string;
    args?: Record<string, unknown>;
    result?: string;
    userPrompt?: string;
}): Promise<HookOutput>;
/**
 * Hook handler for session stop or pre-completion (Pre-Finish Gate)
 */
export declare function onStop(payload: {
    userPrompt?: string;
    turns?: any[];
}): Promise<HookOutput>;
/**
 * Command handler for /advisor slash command
 */
export declare function onAdvisorCommand(args?: string[]): Promise<string>;
/**
 * Standard Claude Code Mod Plugin Registration Middleware
 */
export declare function register(on: (event: string, handler: (...args: any[]) => any) => void): void;
declare const _default: {
    onPrePrompt: typeof onPrePrompt;
    onPostToolUse: typeof onPostToolUse;
    onStop: typeof onStop;
    onAdvisorCommand: typeof onAdvisorCommand;
    register: typeof register;
};
export default _default;
//# sourceMappingURL=index.d.ts.map