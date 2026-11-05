import { describe, it, expect, beforeEach } from 'vitest';
import { ErrorLoopGate } from '../src/gates/error-loop-gate.js';
import { AdvisorConfig } from '../src/types.js';
import { resetSessionState, getSessionState } from '../src/config.js';

describe('Error Loop Gate', () => {
  const baseConfig: AdvisorConfig = {
    mode: 'balanced',
    provider: 'local-mlx',
    model: 'test-model',
    confidenceThreshold: 0.7,
    maxUsesPerSession: 10,
    planningGateEnabled: true,
    errorLoopGateEnabled: true,
    errorThreshold: 2,
    preFinishGateEnabled: true,
  };

  beforeEach(() => {
    resetSessionState();
  });

  it('detects failure patterns in command outputs', () => {
    const gate = new ErrorLoopGate(baseConfig);

    expect(gate.isFailure('Command exited with code 1.')).toBe(true);
    expect(gate.isFailure('npm error code ENOENT')).toBe(true);
    expect(gate.isFailure('TypeError: Cannot read properties of undefined')).toBe(true);
    expect(gate.isFailure('fatal: not a git repository')).toBe(true);
    expect(gate.isFailure('Compilation completed successfully with 0 errors.')).toBe(false);
  });

  it('tracks consecutive failures and resets upon success', async () => {
    const gate = new ErrorLoopGate(baseConfig);

    // Turn 1 failure
    await gate.run('bash', { command: 'npm test' }, 'Command exited with code 1.');
    expect(getSessionState().consecutiveToolErrors).toBe(1);

    // Turn 2 success
    await gate.run('bash', { command: 'npm test' }, 'All 15 tests passed.');
    expect(getSessionState().consecutiveToolErrors).toBe(0);
  });
});
