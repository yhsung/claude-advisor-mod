import { GateEvaluator } from './gate-evaluator.js';
import { getSessionState, updateSessionState } from '../config.js';
export class ErrorLoopGate {
    evaluator;
    config;
    constructor(config) {
        this.config = config;
        this.evaluator = new GateEvaluator(config);
    }
    /**
     * Detects if tool result indicates a failure or error
     */
    isFailure(toolResult) {
        if (!toolResult)
            return false;
        const lower = toolResult.toLowerCase();
        const failurePatterns = [
            /exited with code [1-9]/,
            /npm err!/,
            /npm error/,
            /command not found/,
            /fatal:/,
            /syntaxerror:/,
            /typeerror:/,
            /referenceerror:/,
            /panic:/,
            /traceback \(most recent call last\):/,
            /compilation failed/,
            /build failed/,
            /test failed/,
            /error: /i,
        ];
        return failurePatterns.some((pattern) => pattern.test(lower));
    }
    async run(toolName, toolArgs, toolResult, userPrompt) {
        if (!this.config.errorLoopGateEnabled || this.config.mode === 'disabled') {
            return { continue: true };
        }
        const failed = this.isFailure(toolResult);
        const state = getSessionState();
        if (failed) {
            const nextCount = state.consecutiveToolErrors + 1;
            updateSessionState(() => ({
                consecutiveToolErrors: nextCount,
                lastToolFailed: toolName,
            }));
            // Trigger advisor when threshold reached
            if (nextCount >= this.config.errorThreshold) {
                const context = {
                    userPrompt,
                    toolName,
                    toolArgs,
                    toolResult,
                    consecutiveErrorCount: nextCount,
                    currentTask: `Diagnosing consecutive failures with tool: ${toolName}`,
                };
                const result = await this.evaluator.evaluateGate('error_loop', context);
                return this.evaluator.formatHookOutput(result);
            }
        }
        else {
            // Reset error counter on successful execution
            if (state.consecutiveToolErrors > 0) {
                updateSessionState(() => ({
                    consecutiveToolErrors: 0,
                    lastToolFailed: undefined,
                }));
            }
        }
        return { continue: true };
    }
}
//# sourceMappingURL=error-loop-gate.js.map