import OpenAI from 'openai';
export class LocalMlxProvider {
    name = 'local-mlx';
    model;
    client;
    maxTokens;
    temperature;
    constructor(config) {
        this.model = config.model || 'mlx-community/Qwen2.5-Coder-32B-Instruct-4bit';
        // Constrain tokens for Apple Silicon memory safety
        this.maxTokens = Math.min(config.maxTokens ?? 1024, 2048);
        this.temperature = config.temperature ?? 0.2;
        const baseURL = config.baseUrl || 'http://localhost:8080/v1';
        this.client = new OpenAI({
            apiKey: config.apiKey || 'not-needed-for-local-mlx',
            baseURL,
        });
    }
    async evaluate(systemPrompt, userMessage) {
        try {
            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage },
                ],
                max_tokens: this.maxTokens,
                temperature: this.temperature,
            });
            return completion.choices[0]?.message?.content || '';
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            throw new Error(`[LocalMlxProvider] Failed to connect to local server at ${this.client.baseURL}: ${errorMsg}. Please ensure mlx-lm.server or llama-server is running.`);
        }
    }
}
//# sourceMappingURL=local-mlx-provider.js.map