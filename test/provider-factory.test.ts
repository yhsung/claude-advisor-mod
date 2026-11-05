import { describe, it, expect } from 'vitest';
import { createProvider } from '../src/providers/provider-factory.js';
import { AdvisorConfig } from '../src/types.js';

describe('Provider Factory', () => {
  const baseConfig: AdvisorConfig = {
    mode: 'balanced',
    provider: 'anthropic',
    model: 'claude-3-7-sonnet-20250219',
    confidenceThreshold: 0.75,
    maxUsesPerSession: 10,
    planningGateEnabled: true,
    errorLoopGateEnabled: true,
    errorThreshold: 2,
    preFinishGateEnabled: true,
  };

  it('creates Anthropic provider', () => {
    const provider = createProvider({ ...baseConfig, provider: 'anthropic' });
    expect(provider.name).toBe('anthropic');
    expect(provider.model).toBe('claude-3-7-sonnet-20250219');
  });

  it('creates OpenAI provider', () => {
    const provider = createProvider({ ...baseConfig, provider: 'openai', model: 'gpt-4o' });
    expect(provider.name).toBe('openai');
    expect(provider.model).toBe('gpt-4o');
  });

  it('creates Gemini provider', () => {
    const provider = createProvider({ ...baseConfig, provider: 'gemini', model: 'gemini-2.5-pro' });
    expect(provider.name).toBe('gemini');
    expect(provider.model).toBe('gemini-2.5-pro');
  });

  it('creates Local MLX provider with Apple Silicon defaults', () => {
    const provider = createProvider({
      ...baseConfig,
      provider: 'local-mlx',
      model: 'mlx-community/Qwen2.5-Coder-32B-Instruct-4bit',
      baseUrl: 'http://localhost:8080/v1',
    });
    expect(provider.name).toBe('local-mlx');
    expect(provider.model).toBe('mlx-community/Qwen2.5-Coder-32B-Instruct-4bit');
  });
});
