import { AdvisorConfig, HookOutput } from '../types.js';
export declare class PlanningGate {
    private evaluator;
    private config;
    constructor(config: AdvisorConfig);
    /**
     * Evaluates whether a user prompt represents a complex task that benefits from architectural planning
     */
    shouldTrigger(prompt: string): boolean;
    run(prompt: string, recentTurns?: Array<{
        role: 'user' | 'assistant' | 'system' | 'tool';
        content: string;
    }>): Promise<HookOutput>;
}
//# sourceMappingURL=planning-gate.d.ts.map