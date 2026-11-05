import { AdvisorConfig, ModelProviderType } from '../types.js';
import { AdvisorProvider } from './provider-interface.js';
import { AnthropicProvider } from './anthropic-provider.js';
import { OpenAIProvider } from './openai-provider.js';
import { GeminiProvider } from './gemini-provider.js';
import { LocalMlxProvider } from './local-mlx-provider.js';

export function createProvider(config: AdvisorConfig): AdvisorProvider {
  const providerType: ModelProviderType = config.provider;

  switch (providerType) {
    case 'anthropic':
      return new AnthropicProvider(config);
    case 'openai':
      return new OpenAIProvider(config);
    case 'gemini':
      return new GeminiProvider(config);
    case 'local-mlx':
      return new LocalMlxProvider(config);
    default: {
      const _exhaustiveCheck: never = providerType;
      throw new Error(`Unsupported provider: ${_exhaustiveCheck}`);
    }
  }
}
