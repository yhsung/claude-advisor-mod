import { AdvisorConfig, GateContext, AdvisorEvaluationResult, HookOutput } from '../types.js';
export type GateType = 'planning' | 'error_loop' | 'pre_finish' | 'on_demand';
export declare class GateEvaluator {
    private config;
    constructor(config: AdvisorConfig);
    /**
     * Evaluates context through the advisor LLM
     */
    evaluateGate(gateType: GateType, context: GateContext): Promise<AdvisorEvaluationResult | null>;
    /**
     * Converts evaluation result into Hook output for Claude Code
     */
    formatHookOutput(result: AdvisorEvaluationResult | null): HookOutput;
}
//# sourceMappingURL=gate-evaluator.d.ts.map