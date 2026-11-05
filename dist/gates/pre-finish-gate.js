import { GateEvaluator } from './gate-evaluator.js';
export class PreFinishGate {
    evaluator;
    config;
    constructor(config) {
        this.config = config;
        this.evaluator = new GateEvaluator(config);
    }
    async run(userPrompt, recentTurns) {
        if (!this.config.preFinishGateEnabled || this.config.mode === 'disabled') {
            return { continue: true };
        }
        const context = {
            userPrompt,
            recentTurns,
            currentTask: 'Pre-completion audit: verify git diff against initial user requirements, check test coverage and edge cases',
        };
        const result = await this.evaluator.evaluateGate('pre_finish', context);
        return this.evaluator.formatHookOutput(result);
    }
}
//# sourceMappingURL=pre-finish-gate.js.map