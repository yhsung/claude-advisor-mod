import { AdvisorProvider } from './provider-interface.js';
import { AdvisorConfig } from '../types.js';
export declare class GeminiProvider implements AdvisorProvider {
    readonly name = "gemini";
    readonly model: string;
    private client;
    private maxTokens;
    private temperature;
    constructor(config: AdvisorConfig);
    evaluate(systemPrompt: string, userMessage: string): Promise<string>;
}
//# sourceMappingURL=gemini-provider.d.ts.map