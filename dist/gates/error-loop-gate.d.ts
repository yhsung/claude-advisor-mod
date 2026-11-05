import { AdvisorConfig, HookOutput } from '../types.js';
export declare class ErrorLoopGate {
    private evaluator;
    private config;
    constructor(config: AdvisorConfig);
    /**
     * Detects if tool result indicates a failure or error
     */
    isFailure(toolResult: string): boolean;
    run(toolName: string, toolArgs: Record<string, unknown>, toolResult: string, userPrompt?: string): Promise<HookOutput>;
}
//# sourceMappingURL=error-loop-gate.d.ts.map