import { Anthropic } from '@anthropic-ai/sdk';
export class AnthropicProvider {
    name = 'anthropic';
    model;
    client;
    maxTokens;
    temperature;
    constructor(config) {
        this.model = config.model || 'claude-3-7-sonnet-20250219';
        this.maxTokens = config.maxTokens ?? 2048;
        this.temperature = config.temperature ?? 0.2;
        this.client = new Anthropic({
            apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY || 'not-provided',
            baseURL: config.baseUrl,
        });
    }
    async evaluate(systemPrompt, userMessage) {
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
            .map((block) => block.text);
        return textBlocks.join('\n');
    }
}
//# sourceMappingURL=anthropic-provider.js.map