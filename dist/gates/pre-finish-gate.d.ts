import { AdvisorConfig, HookOutput } from '../types.js';
export declare class PreFinishGate {
    private evaluator;
    private config;
    constructor(config: AdvisorConfig);
    run(userPrompt: string, recentTurns?: Array<{
        role: 'user' | 'assistant' | 'system' | 'tool';
        content: string;
    }>): Promise<HookOutput>;
}
//# sourceMappingURL=pre-finish-gate.d.ts.map