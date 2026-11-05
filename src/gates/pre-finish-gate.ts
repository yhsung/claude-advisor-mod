import { AdvisorConfig, GateContext, HookOutput } from '../types.js';
import { GateEvaluator } from './gate-evaluator.js';

export class PreFinishGate {
  private evaluator: GateEvaluator;
  private config: AdvisorConfig;

  constructor(config: AdvisorConfig) {
    this.config = config;
    this.evaluator = new GateEvaluator(config);
  }

  async run(
    userPrompt: string,
    recentTurns?: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }>
  ): Promise<HookOutput> {
    if (!this.config.preFinishGateEnabled || this.config.mode === 'disabled') {
      return { continue: true };
    }

    const context: GateContext = {
      userPrompt,
      recentTurns,
      currentTask: 'Pre-completion audit: verify git diff against initial user requirements, check test coverage and edge cases',
    };

    const result = await this.evaluator.evaluateGate('pre_finish', context);
    return this.evaluator.formatHookOutput(result);
  }
}
