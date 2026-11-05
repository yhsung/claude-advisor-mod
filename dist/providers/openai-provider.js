import OpenAI from 'openai';
export class OpenAIProvider {
    name = 'openai';
    model;
    client;
    maxTokens;
    temperature;
    constructor(config) {
        this.model = config.model || 'gpt-4o';
        this.maxTokens = config.maxTokens ?? 2048;
        this.temperature = config.temperature ?? 0.2;
        this.client = new OpenAI({
            apiKey: config.apiKey || process.env.OPENAI_API_KEY || 'not-provided',
            baseURL: config.baseUrl,
        });
    }
    async evaluate(systemPrompt, userMessage) {
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
//# sourceMappingURL=openai-provider.js.map