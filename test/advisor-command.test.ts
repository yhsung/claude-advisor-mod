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

  it('handles /advisor model without args to show selector menu', async () => {
    const output = await handleAdvisorCommand(['model']);
    expect(output).toContain('[Claude Advisor Model Selector]');
    expect(output).toContain('[1] Claude 3.7 Sonnet');
    expect(output).toContain('[2] Claude 3 Opus');
    expect(output).toContain('[7] Qwen 2.5 Coder 32B (MLX)');
  });

  it('handles /advisor model with number to switch preset', async () => {
    const output = await handleAdvisorCommand(['model', '2']);
    expect(output).toContain('Claude 3 Opus');
    expect(output).toContain('claude-3-opus-20240229');

    const config = loadConfig();
    expect(config.model).toBe('claude-3-opus-20240229');
    expect(config.provider).toBe('anthropic');
  });

  it('handles /advisor model with MLX preset number', async () => {
    const output = await handleAdvisorCommand(['model', '7']);
    expect(output).toContain('Qwen 2.5 Coder 32B (MLX)');

    const config = loadConfig();
    expect(config.model).toBe('mlx-community/Qwen2.5-Coder-32B-Instruct-4bit');
    expect(config.provider).toBe('local-mlx');
  });

  it('handles /advisor model custom name with inferred provider', async () => {
    const output = await handleAdvisorCommand(['model', 'gpt-4o']);
    expect(output).toContain('gpt-4o');

    const config = loadConfig();
    expect(config.model).toBe('gpt-4o');
    expect(config.provider).toBe('openai');
  });
});
