import { GoogleGenAI } from '@google/genai';
export class GeminiProvider {
    name = 'gemini';
    model;
    client;
    maxTokens;
    temperature;
    constructor(config) {
        this.model = config.model || 'gemini-2.5-pro';
        this.maxTokens = config.maxTokens ?? 2048;
        this.temperature = config.temperature ?? 0.2;
        const apiKey = config.apiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || 'not-provided';
        this.client = new GoogleGenAI({ apiKey });
    }
    async evaluate(systemPrompt, userMessage) {
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
//# sourceMappingURL=gemini-provider.js.map