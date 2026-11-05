import { describe, it, expect } from 'vitest';
import { PlanningGate } from '../src/gates/planning-gate.js';
import { AdvisorConfig } from '../src/types.js';

describe('Planning Gate', () => {
  const config: AdvisorConfig = {
    mode: 'balanced',
    provider: 'local-mlx',
    model: 'test-model',
    confidenceThreshold: 0.75,
    maxUsesPerSession: 10,
    planningGateEnabled: true,
    errorLoopGateEnabled: true,
    errorThreshold: 2,
    preFinishGateEnabled: true,
  };

  it('skips short or trivial user prompts', () => {
    const gate = new PlanningGate(config);

    expect(gate.shouldTrigger('ok')).toBe(false);
    expect(gate.shouldTrigger('yes please')).toBe(false);
    expect(gate.shouldTrigger('git status')).toBe(false);
  });

  it('triggers on architectural or complex prompts with keywords', () => {
    const gate = new PlanningGate(config);

    expect(gate.shouldTrigger('請幫我規劃並實作一個全新微服務架構，包含資料庫遷移與重構計畫')).toBe(true);
    expect(gate.shouldTrigger('Please refactor the authentication module to support OAuth2 and PKCE')).toBe(true);
  });

  it('respects disabled mode or planningGateEnabled toggle', () => {
    const disabledGate = new PlanningGate({ ...config, mode: 'disabled' });
    expect(disabledGate.shouldTrigger('Please refactor the whole architecture')).toBe(false);

    const toggleOffGate = new PlanningGate({ ...config, planningGateEnabled: false });
    expect(toggleOffGate.shouldTrigger('Please refactor the whole architecture')).toBe(false);
  });
});
