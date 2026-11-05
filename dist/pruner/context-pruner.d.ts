import { GateContext } from '../types.js';
export interface PrunerOptions {
    maxTotalChars?: number;
    maxToolResultChars?: number;
    maxRecentTurns?: number;
}
/**
 * Truncates text by preserving head and tail, dropping the middle.
 */
export declare function truncateMiddle(text: string, maxChars: number): string;
/**
 * Strips base64 data URIs and binary-like strings to avoid polluting prompt
 */
export declare function stripBinaryBlobs(text: string): string;
/**
 * Prunes the GateContext into a concise, high-signal representation for the advisor
 */
export declare function pruneContext(context: GateContext, options?: PrunerOptions): string;
//# sourceMappingURL=context-pruner.d.ts.map