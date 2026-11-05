import { AdvisorProvider } from './provider-interface.js';
import { AdvisorConfig } from '../types.js';
export declare class LocalMlxProvider implements AdvisorProvider {
    readonly name = "local-mlx";
    readonly model: string;
    private client;
    private maxTokens;
    private temperature;
    constructor(config: AdvisorConfig);
    evaluate(systemPrompt: string, userMessage: string): Promise<string>;
}
//# sourceMappingURL=local-mlx-provider.d.ts.map