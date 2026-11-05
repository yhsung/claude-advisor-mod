import OpenAI from 'openai';
import { AdvisorProvider } from './provider-interface.js';
import { AdvisorConfig } from '../types.js';

export class OpenAIProvider implements AdvisorProvider {
  public readonly name = 'openai';
  public readonly model: string;
  private client: OpenAI;
  private maxTokens: number;
  private temperature: number;

  constructor(config: AdvisorConfig) {
    this.model = config.model || 'gpt-4o';
    this.maxTokens = config.maxTokens ?? 2048;
    this.temperature = config.temperature ?? 0.2;

    this.client = new OpenAI({
      apiKey: config.apiKey || process.env.OPENAI_API_KEY || 'not-provided',
      baseURL: config.baseUrl,
    });
  }

  async evaluate(systemPrompt: string, userMessage: string): Promise<string> {
    const isReasoningModel = this.model.startsWith('o1') || this.model.startsWith('o3');

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      ...(isReasoningModel
        ? { max_completion_tokens: this.maxTokens }
        : { max_tokens: this.maxTokens, temperature: this.temperature }),
    });

    return completion.choices[0]?.message?.content || '';
  }
}
