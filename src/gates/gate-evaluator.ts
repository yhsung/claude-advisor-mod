import { AdvisorConfig, GateContext, AdvisorEvaluationResult, HookOutput } from '../types.js';
import { createProvider } from '../providers/provider-factory.js';
import { pruneContext } from '../pruner/context-pruner.js';
import { extractGitDiff } from '../pruner/diff-extractor.js';
import { ADVISOR_SYSTEM_PROMPT, parseAdvisorResponse } from '../pruner/prompt-templates.js';
import { getSessionState, updateSessionState } from '../config.js';

export type GateType = 'planning' | 'error_loop' | 'pre_finish' | 'on_demand';

export class GateEvaluator {
  private config: AdvisorConfig;

  constructor(config: AdvisorConfig) {
    this.config = config;
  }

  /**
   * Evaluates context through the advisor LLM
   */
  async evaluateGate(gateType: GateType, context: GateContext): Promise<AdvisorEvaluationResult | null> {
    if (this.config.mode === 'disabled') {
      return null;
    }

    const state = getSessionState();
    if (state.consultationCount >= this.config.maxUsesPerSession) {
      return null; // Exceeded session budget
    }

    // Attach git diff if not already provided
    if (!context.gitDiff && (gateType === 'pre_finish' || gateType === 'on_demand' || gateType === 'planning')) {
      context.gitDiff = extractGitDiff();
    }

    const prunedUserMessage = pruneContext(context);
    const startTime = Date.now();

    try {
      const provider = createProvider(this.config);
      const rawResponse = await provider.evaluate(ADVISOR_SYSTEM_PROMPT, prunedUserMessage);
      const result = parseAdvisorResponse(rawResponse);
      const latencyMs = Date.now() - startTime;

      result.providerUsed = provider.name;
      result.modelUsed = provider.model;
      result.latencyMs = latencyMs;

      // Filter by confidence threshold: If confidence is lower than configured threshold, treat as pass
      if (result.confidence < this.config.confidenceThreshold && result.verdict !== 'block') {
        result.verdict = 'pass';
      }

      // Record in session state
      updateSessionState((prev) => ({
        consultationCount: prev.consultationCount + 1,
        history: [
          ...prev.history,
          {
            timestamp: Date.now(),
            trigger: gateType,
            verdict: result.verdict,
            summary: result.summary,
          },
        ],
      }));

      return result;
    } catch (err: unknown) {
      // In case of provider error, do not crash the primary agent. Return silent pass with log
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[claude-advisor-mod] Advisor evaluation failed: ${msg}`);
      return null;
    }
  }

  /**
   * Converts evaluation result into Hook output for Claude Code
   */
  formatHookOutput(result: AdvisorEvaluationResult | null): HookOutput {
    if (!result || result.verdict === 'pass') {
      return { continue: true };
    }

    const mode = this.config.mode;
    const isBlock = result.verdict === 'block';

    const feedbackLines = result.feedback.map((item) => `  * ${item}`).join('\n');
    const headerBadge = isBlock ? '🛑 [ADVISOR BLOCKER]' : '💡 [ADVISOR ADVICE]';

    const message = [
      `${headerBadge} (Category: ${result.category}, Score: ${result.score}/10, Model: ${result.modelUsed || 'advisor'})`,
      `> ${result.summary}`,
      feedbackLines ? `\nObservations:\n${feedbackLines}` : '',
      result.suggestedAction ? `\nRecommended Action:\n> ${result.suggestedAction}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    // If mode is strict and verdict is block, request pause/abort
    if (mode === 'strict' && isBlock) {
      return {
        continue: false,
        message,
        injectedContext: message,
      };
    }

    // Otherwise, continue execution but inject advice into conversation context
    return {
      continue: true,
      message,
      injectedContext: message,
    };
  }
}
