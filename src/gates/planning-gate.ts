import { AdvisorConfig, GateContext, HookOutput } from '../types.js';
import { GateEvaluator } from './gate-evaluator.js';

export class PlanningGate {
  private evaluator: GateEvaluator;
  private config: AdvisorConfig;

  constructor(config: AdvisorConfig) {
    this.config = config;
    this.evaluator = new GateEvaluator(config);
  }

  /**
   * Evaluates whether a user prompt represents a complex task that benefits from architectural planning
   */
  shouldTrigger(prompt: string): boolean {
    if (!this.config.planningGateEnabled || this.config.mode === 'disabled') {
      return false;
    }

    const trimmed = prompt.trim();
    // Trivial prompts (e.g. "yes", "git status", "ok", "/clear") do not need planning review
    if (trimmed.length < 15) {
      return false;
    }

    const keywords = [
      'plan', '規劃', '架構', 'architect', 'refactor', '重構',
      'implement', '實作', 'design', '設計', 'migrate', '遷移',
      'feature', '功能', 'bug', '修復', 'fix', 'integrate', '整合'
    ];

    const hasKeyword = keywords.some((kw) => trimmed.toLowerCase().includes(kw));
    return hasKeyword || trimmed.length > 200;
  }

  async run(prompt: string, recentTurns?: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }>): Promise<HookOutput> {
    if (!this.shouldTrigger(prompt)) {
      return { continue: true };
    }

    const context: GateContext = {
      userPrompt: prompt,
      recentTurns,
      currentTask: 'Initial planning and design evaluation before code modifications',
    };

    const result = await this.evaluator.evaluateGate('planning', context);
    return this.evaluator.formatHookOutput(result);
  }
}
