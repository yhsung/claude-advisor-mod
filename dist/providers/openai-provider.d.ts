import { AdvisorProvider } from './provider-interface.js';
import { AdvisorConfig } from '../types.js';
export declare class OpenAIProvider implements AdvisorProvider {
    readonly name = "openai";
    readonly model: string;
    private client;
    private maxTokens;
    private temperature;
    constructor(config: AdvisorConfig);
    evaluate(systemPrompt: string, userMessage: string): Promise<string>;
}
//# sourceMappingURL=openai-provider.d.ts.map