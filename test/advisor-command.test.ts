import { describe, it, expect, beforeEach } from 'vitest';
import { handleAdvisorCommand } from '../src/commands/advisor-command.js';
import { loadConfig, resetSessionState } from '../src/config.js';

describe('Advisor Commands', () => {
  beforeEach(() => {
    resetSessionState();
  });

  it('handles /advisor status', async () => {
    const output = await handleAdvisorCommand(['status']);
    expect(output).toContain('[Claude Advisor Status]');
    expect(output).toContain('Active Mode:');
    expect(output).toContain('Provider:');
    expect(output).toContain('Gates:');
  });

  it('handles /advisor toggle', async () => {
    const toggleOutput = await handleAdvisorCommand(['toggle']);
    expect(toggleOutput).toMatch(/(ENABLED|DISABLED)/);
  });

  it('handles /advisor mode update', async () => {
    const output = await handleAdvisorCommand(['mode', 'strict']);
    expect(output).toContain('STRICT');

    const config = loadConfig();
    expect(config.mode).toBe('strict');
  });

  it('handles /advisor provider update', async () => {
    const output = await handleAdvisorCommand(['provider', 'local-mlx']);
    expect(output).toContain('local-mlx');

    const config = loadConfig();
    expect(config.provider).toBe('local-mlx');
  });

  it('handles /advisor model update', async () => {
    const output = await handleAdvisorCommand(['model', 'custom-test-model']);
    expect(output).toContain('custom-test-model');

    const config = loadConfig();
    expect(config.model).toBe('custom-test-model');
  });
});
