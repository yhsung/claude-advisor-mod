import { loadConfig } from './config.js';
import { PlanningGate } from './gates/planning-gate.js';
import { ErrorLoopGate } from './gates/error-loop-gate.js';
import { PreFinishGate } from './gates/pre-finish-gate.js';
import { handleAdvisorCommand } from './commands/advisor-command.js';
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
export async function onPrePrompt(payload: { prompt: string; turns?: any[] }): Promise<HookOutput> {
  const config = loadConfig();
  const gate = new PlanningGate(config);
  return gate.run(payload.prompt, payload.turns);
}

/**
 * Hook handler for tool execution output (Error Loop Gate)
 */
export async function onPostToolUse(payload: {
  tool: string;
  args?: Record<string, unknown>;
  result?: string;
  userPrompt?: string;
}): Promise<HookOutput> {
  const config = loadConfig();
  const gate = new ErrorLoopGate(config);
  return gate.run(
    payload.tool,
    payload.args || {},
    payload.result || '',
    payload.userPrompt
  );
}

/**
 * Hook handler for session stop or pre-completion (Pre-Finish Gate)
 */
export async function onStop(payload: { userPrompt?: string; turns?: any[] }): Promise<HookOutput> {
  const config = loadConfig();
  const gate = new PreFinishGate(config);
  return gate.run(payload.userPrompt || '', payload.turns);
}

/**
 * Command handler for /advisor slash command
 */
export async function onAdvisorCommand(args: string[] = []): Promise<string> {
  return handleAdvisorCommand(args);
}

/**
 * Standard Claude Code Mod Plugin Registration Middleware
 */
export function register(on: (event: string, handler: (...args: any[]) => any) => void): void {
  on('PrePrompt', async (payload: any) => {
    return onPrePrompt(payload);
  });

  on('PostToolUse', async (payload: any) => {
    return onPostToolUse(payload);
  });

  on('Stop', async (payload: any) => {
    return onStop(payload);
  });

  on('Command:advisor', async (args: string[]) => {
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
