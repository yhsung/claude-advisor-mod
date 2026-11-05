import { AdvisorProvider } from './provider-interface.js';
import { AdvisorConfig } from '../types.js';
export declare class AnthropicProvider implements AdvisorProvider {
    readonly name = "anthropic";
    readonly model: string;
    private client;
    private maxTokens;
    private temperature;
    constructor(config: AdvisorConfig);
    evaluate(systemPrompt: string, userMessage: string): Promise<string>;
}
//# sourceMappingURL=anthropic-provider.d.ts.map