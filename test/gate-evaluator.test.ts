import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GateEvaluator } from '../src/gates/gate-evaluator.js';
import { AdvisorConfig, GateContext } from '../src/types.js';
import { resetSessionState, getSessionState } from '../src/config.js';
import * as providerFactory from '../src/providers/provider-factory.js';

describe('Gate Evaluator', () => {
  const config: AdvisorConfig = {
    mode: 'balanced',
    provider: 'local-mlx',
    model: 'test-model',
    confidenceThreshold: 0.75,
    maxUsesPerSession: 3,
    planningGateEnabled: true,
    errorLoopGateEnabled: true,
    errorThreshold: 2,
    preFinishGateEnabled: true,
  };

  beforeEach(() => {
    resetSessionState();
    vi.restoreAllMocks();
  });

  it('formats hook output for pass verdict with continue=true and no message', () => {
    const evaluator = new GateEvaluator(config);
    const output = evaluator.formatHookOutput({
      verdict: 'pass',
      score: 9,
      confidence: 0.9,
      category: 'general',
      summary: 'All good',
      feedback: [],
    });

    expect(output.continue).toBe(true);
    expect(output.message).toBeUndefined();
  });

  it('formats warning verdict with continue=true and advice message', () => {
    const evaluator = new GateEvaluator(config);
    const output = evaluator.formatHookOutput({
      verdict: 'warning',
      score: 5,
      confidence: 0.85,
      category: 'bug',
      summary: 'Potential race condition detected',
      feedback: ['File handle is not closed'],
      suggestedAction: 'Wrap in try...finally block',
      modelUsed: 'claude-3-7-sonnet',
    });

    expect(output.continue).toBe(true);
    expect(output.message).toContain('ADVISOR ADVICE');
    expect(output.message).toContain('Potential race condition detected');
    expect(output.message).toContain('Wrap in try...finally block');
  });

  it('formats block verdict with continue=false when mode is strict', () => {
    const strictEvaluator = new GateEvaluator({ ...config, mode: 'strict' });
    const output = strictEvaluator.formatHookOutput({
      verdict: 'block',
      score: 2,
      confidence: 0.95,
      category: 'security',
      summary: 'Detected hardcoded secret in staging diff',
      feedback: ['API key in plain text on line 12'],
      suggestedAction: 'Move to environment variable',
    });

    expect(output.continue).toBe(false);
    expect(output.message).toContain('ADVISOR BLOCKER');
  });

  it('stops evaluating when session limit is reached', async () => {
    const mockProvider = {
      name: 'mock',
      model: 'mock-model',
      evaluate: vi.fn().mockResolvedValue(
        JSON.stringify({
          verdict: 'pass',
          score: 8,
          confidence: 0.9,
          summary: 'Ok',
          feedback: [],
        })
      ),
    };
    vi.spyOn(providerFactory, 'createProvider').mockReturnValue(mockProvider as any);

    const limitedEvaluator = new GateEvaluator({ ...config, maxUsesPerSession: 2 });
    const ctx: GateContext = { userPrompt: 'Do task' };

    // Call 1
    const res1 = await limitedEvaluator.evaluateGate('planning', ctx);
    expect(res1).not.toBeNull();

    // Call 2
    const res2 = await limitedEvaluator.evaluateGate('planning', ctx);
    expect(res2).not.toBeNull();
    expect(getSessionState().consultationCount).toBe(2);

    // Call 3 (exceeds budget 2)
    const res3 = await limitedEvaluator.evaluateGate('planning', ctx);
    expect(res3).toBeNull();
  });
});
