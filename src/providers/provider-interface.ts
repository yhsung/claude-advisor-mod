import { AdvisorConfig } from '../types.js';

export interface AdvisorProvider {
  readonly name: string;
  readonly model: string;
  evaluate(systemPrompt: string, userMessage: string): Promise<string>;
}

export type ProviderConstructor = (config: AdvisorConfig) => AdvisorProvider;
