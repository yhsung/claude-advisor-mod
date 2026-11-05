import { GateContext } from '../types.js';

export interface PrunerOptions {
  maxTotalChars?: number;
  maxToolResultChars?: number;
  maxRecentTurns?: number;
}

const DEFAULT_OPTIONS: Required<PrunerOptions> = {
  maxTotalChars: 12000,
  maxToolResultChars: 1500,
  maxRecentTurns: 4,
};

/**
 * Truncates text by preserving head and tail, dropping the middle.
 */
export function truncateMiddle(text: string, maxChars: number): string {
  if (!text || text.length <= maxChars) {
    return text;
  }
  const half = Math.floor(maxChars / 2) - 30;
  const head = text.slice(0, half);
  const tail = text.slice(text.length - half);
  const omitted = text.length - head.length - tail.length;
  return `${head}\n... [omitted ${omitted} characters] ...\n${tail}`;
}

/**
 * Strips base64 data URIs and binary-like strings to avoid polluting prompt
 */
export function stripBinaryBlobs(text: string): string {
  if (!text) return '';
  return text
    .replace(/data:[^;]+;base64,[a-zA-Z0-9+/=]{50,}/g, '[base64 image/binary omitted]')
    .replace(/[a-fA-F0-9]{128,}/g, '[hex hash/blob omitted]');
}

/**
 * Prunes the GateContext into a concise, high-signal representation for the advisor
 */
export function pruneContext(context: GateContext, options: PrunerOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const sections: string[] = [];

  if (context.userPrompt) {
    sections.push(`### Original User Goal / Prompt:\n${truncateMiddle(context.userPrompt.trim(), 1500)}`);
  }

  if (context.currentTask) {
    sections.push(`### Current Active Task:\n${truncateMiddle(context.currentTask.trim(), 800)}`);
  }

  if (context.consultationQuestion) {
    sections.push(`### Specific Question to Advisor:\n${context.consultationQuestion.trim()}`);
  }

  if (context.recentTurns && context.recentTurns.length > 0) {
    const recent = context.recentTurns.slice(-opts.maxRecentTurns);
    const formattedTurns = recent
      .map((turn, i) => {
        const cleaned = stripBinaryBlobs(truncateMiddle(turn.content.trim(), 600));
        return `[Turn ${i + 1}] (${turn.role}):\n${cleaned}`;
      })
      .join('\n\n');
    sections.push(`### Recent Conversation Context (Last ${recent.length} turns):\n${formattedTurns}`);
  }

  if (context.toolName) {
    const argsStr = context.toolArgs ? JSON.stringify(context.toolArgs, null, 2) : 'none';
    sections.push(`### Current Tool Invocation:\nTool: ${context.toolName}\nArguments:\n${truncateMiddle(argsStr, 800)}`);
  }

  if (context.toolResult) {
    const cleanedResult = stripBinaryBlobs(truncateMiddle(context.toolResult.trim(), opts.maxToolResultChars));
    sections.push(`### Tool Execution Output:\n${cleanedResult}`);
  }

  if (context.consecutiveErrorCount && context.consecutiveErrorCount > 0) {
    sections.push(`### Notice:\nConsecutive tool error count: ${context.consecutiveErrorCount}`);
  }

  if (context.gitDiff) {
    const cleanedDiff = truncateMiddle(context.gitDiff.trim(), 3000);
    sections.push(`### Current Git Diff / Changes:\n${cleanedDiff}`);
  }

  const combined = sections.join('\n\n---\n\n');
  return truncateMiddle(combined, opts.maxTotalChars);
}
