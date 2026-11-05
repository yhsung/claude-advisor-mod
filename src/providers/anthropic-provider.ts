import { Anthropic } from '@anthropic-ai/sdk';
import { AdvisorProvider } from './provider-interface.js';
import { AdvisorConfig } from '../types.js';

export class AnthropicProvider implements AdvisorProvider {
  public readonly name = 'anthropic';
  public readonly model: string;
  private client: Anthropic;
  private maxTokens: number;
  private temperature: number;

  constructor(config: AdvisorConfig) {
    this.model = config.model || 'claude-3-7-sonnet-20250219';
    this.maxTokens = config.maxTokens ?? 2048;
    this.temperature = config.temperature ?? 0.2;

    this.client = new Anthropic({
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY || 'not-provided',
      baseURL: config.baseUrl,
    });
  }

  async evaluate(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const textBlocks = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text);

    return textBlocks.join('\n');
  }
}
