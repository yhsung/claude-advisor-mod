import { ModelProviderType } from '../types.js';
export interface ModelPreset {
    id: number;
    provider: ModelProviderType;
    model: string;
    name: string;
    description: string;
}
export declare const MODEL_PRESETS: ModelPreset[];
export declare function handleAdvisorCommand(args: string[]): Promise<string>;
//# sourceMappingURL=advisor-command.d.ts.map