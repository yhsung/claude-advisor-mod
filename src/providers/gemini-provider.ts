import { GoogleGenAI } from '@google/genai';
import { AdvisorProvider } from './provider-interface.js';
import { AdvisorConfig } from '../types.js';

export class GeminiProvider implements AdvisorProvider {
  public readonly name = 'gemini';
  public readonly model: string;
  private client: GoogleGenAI;
  private maxTokens: number;
  private temperature: number;

  constructor(config: AdvisorConfig) {
    this.model = config.model || 'gemini-2.5-pro';
    this.maxTokens = config.maxTokens ?? 2048;
    this.temperature = config.temperature ?? 0.2;

    const apiKey = config.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'not-provided';
    this.client = new GoogleGenAI({ apiKey });
  }

  async evaluate(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await this.client.models.generateContent({
      model: this.model,
      contents: userMessage,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: this.maxTokens,
        temperature: this.temperature,
      },
    });

    return response.text || '';
  }
}
