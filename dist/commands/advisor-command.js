import { loadConfig, saveConfig, getSessionState, resetSessionState } from '../config.js';
import { GateEvaluator } from '../gates/gate-evaluator.js';
export const MODEL_PRESETS = [
    { id: 1, provider: 'anthropic', model: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', description: 'Anthropic hybrid reasoning & fast coding' },
    { id: 2, provider: 'anthropic', model: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Anthropic deep architecture & code review' },
    { id: 3, provider: 'openai', model: 'gpt-4o', name: 'GPT-4o', description: 'OpenAI multi-domain flagship' },
    { id: 4, provider: 'openai', model: 'o3-mini', name: 'o3-mini', description: 'OpenAI high-speed reasoning' },
    { id: 5, provider: 'gemini', model: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'Google multimodal & deep context' },
    { id: 6, provider: 'gemini', model: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'Google low-latency balanced model' },
    { id: 7, provider: 'local-mlx', model: 'mlx-community/Qwen2.5-Coder-32B-Instruct-4bit', name: 'Qwen 2.5 Coder 32B (MLX)', description: 'Local Apple Silicon 4-bit, zero API cost' },
    { id: 8, provider: 'local-mlx', model: 'mlx-community/DeepSeek-R1-Distill-Qwen-32B-4bit', name: 'DeepSeek R1 Distill 32B (MLX)', description: 'Local Apple Silicon reasoning, zero cost' },
];
/**
 * Infer provider type from model identifier
 */
function inferProvider(modelName) {
    const lower = modelName.toLowerCase();
    if (lower.startsWith('claude'))
        return 'anthropic';
    if (lower.startsWith('gpt') || lower.startsWith('o1') || lower.startsWith('o3'))
        return 'openai';
    if (lower.startsWith('gemini'))
        return 'gemini';
    if (lower.startsWith('mlx') || lower.includes('qwen') || lower.includes('llama') || lower.includes('deepseek'))
        return 'local-mlx';
    return undefined;
}
export async function handleAdvisorCommand(args) {
    const subCommand = (args[0] || 'status').toLowerCase();
    const config = loadConfig();
    const state = getSessionState();
    switch (subCommand) {
        case 'status': {
            return [
                '📊 [Claude Advisor Status]',
                `• Active Mode: ${config.mode.toUpperCase()}`,
                `• Provider: ${config.provider}`,
                `• Model: ${config.model}`,
                `• Base URL: ${config.baseUrl || '(default cloud endpoint)'}`,
                `• Confidence Threshold: ${config.confidenceThreshold}`,
                `• Gates: [Planning: ${config.planningGateEnabled ? 'ON' : 'OFF'}, ErrorLoop: ${config.errorLoopGateEnabled ? 'ON' : 'OFF'}, PreFinish: ${config.preFinishGateEnabled ? 'ON' : 'OFF'}]`,
                `• Session Consultations: ${state.consultationCount} / ${config.maxUsesPerSession}`,
                `• Current Consecutive Tool Errors: ${state.consecutiveToolErrors}`,
                `• History Recorded: ${state.history.length} events`,
            ].join('\n');
        }
        case 'toggle': {
            const nextMode = config.mode === 'disabled' ? 'balanced' : 'disabled';
            saveConfig({ mode: nextMode });
            return `Advisor is now ${nextMode === 'disabled' ? '🔴 DISABLED' : `🟢 ENABLED (${nextMode.toUpperCase()})`}`;
        }
        case 'mode': {
            const modeArg = args[1]?.toLowerCase();
            const validModes = ['advisory', 'balanced', 'strict', 'disabled'];
            if (!modeArg || !validModes.includes(modeArg)) {
                return `Usage: /advisor mode <advisory|balanced|strict|disabled>. Current: ${config.mode}`;
            }
            saveConfig({ mode: modeArg });
            return `Advisor mode updated to: ${modeArg.toUpperCase()}`;
        }
        case 'provider': {
            const providerArg = args[1]?.toLowerCase();
            const validProviders = ['anthropic', 'openai', 'gemini', 'local-mlx'];
            if (!providerArg || !validProviders.includes(providerArg)) {
                return `Usage: /advisor provider <anthropic|openai|gemini|local-mlx>. Current: ${config.provider}`;
            }
            saveConfig({ provider: providerArg });
            return `Advisor provider updated to: ${providerArg}`;
        }
        case 'model': {
            const modelArg = args.slice(1).join(' ').trim();
            // If no argument is provided, display preset menu with numbers
            if (!modelArg) {
                const presetLines = MODEL_PRESETS.map((p) => {
                    const isCurrent = p.model === config.model;
                    const mark = isCurrent ? '👉 ' : '   ';
                    return `${mark}[${p.id}] ${p.name.padEnd(28)} (${p.provider.toUpperCase()})\n       Model: ${p.model}\n       Desc : ${p.description}`;
                }).join('\n\n');
                return [
                    '🧠 [Claude Advisor Model Selector]',
                    `Current Active: ${config.model} (Provider: ${config.provider})`,
                    '',
                    'Select by typing: /advisor model <number> or <model-name>',
                    '------------------------------------------------------------',
                    presetLines,
                    '------------------------------------------------------------',
                    'Example: /advisor model 2  (Switches to Claude 3 Opus)',
                    'Example: /advisor model 7  (Switches to Local Apple Silicon MLX)',
                ].join('\n');
            }
            // Check if user specified a number (e.g., "1", "2")
            const presetNum = parseInt(modelArg, 10);
            const matchedPreset = !isNaN(presetNum)
                ? MODEL_PRESETS.find((p) => p.id === presetNum)
                : MODEL_PRESETS.find((p) => p.model.toLowerCase() === modelArg.toLowerCase());
            if (matchedPreset) {
                saveConfig({
                    model: matchedPreset.model,
                    provider: matchedPreset.provider,
                    ...(matchedPreset.provider === 'local-mlx' && !config.baseUrl ? { baseUrl: 'http://localhost:8080/v1' } : {}),
                });
                return `✅ Advisor model switched to: [${matchedPreset.name}]\n• Model: ${matchedPreset.model}\n• Provider: ${matchedPreset.provider}`;
            }
            // Custom model name
            const inferred = inferProvider(modelArg);
            saveConfig({
                model: modelArg,
                ...(inferred ? { provider: inferred } : {}),
            });
            return `✅ Advisor model updated to: ${modelArg}${inferred ? ` (Auto-assigned provider: ${inferred})` : ''}`;
        }
        case 'reset': {
            resetSessionState();
            return 'Advisor session counters and error state have been reset.';
        }
        case 'test': {
            const testQuestion = args.slice(1).join(' ').trim() || 'Please verify the advisor connectivity and return an architectural status check.';
            const evaluator = new GateEvaluator(config);
            const res = await evaluator.evaluateGate('on_demand', {
                consultationQuestion: testQuestion,
                currentTask: 'Testing advisor connectivity via /advisor test',
            });
            if (!res) {
                return 'Test failed: Advisor returned null (check if mode is disabled or API key is missing).';
            }
            return [
                `✅ Advisor Test Succeeded! [Model: ${res.modelUsed || config.model}]`,
                `Verdict: ${res.verdict.toUpperCase()}`,
                `Score: ${res.score}/10 | Confidence: ${res.confidence}`,
                `Summary: ${res.summary}`,
                res.suggestedAction ? `Advice: ${res.suggestedAction}` : '',
            ]
                .filter(Boolean)
                .join('\n');
        }
        default:
            return [
                'Claude Advisor Mod Commands:',
                '  /advisor status               Show current configuration and metrics',
                '  /advisor model                Show model selection menu & presets (1-8)',
                '  /advisor model <1-8|name>     Switch advisor model and provider',
                '  /advisor toggle               Toggle between active and disabled',
                '  /advisor mode <mode>          Set mode (advisory, balanced, strict, disabled)',
                '  /advisor provider <provider>  Set provider (anthropic, openai, gemini, local-mlx)',
                '  /advisor test [query]         Run an immediate diagnostic check',
                '  /advisor reset                Reset session counters',
            ].join('\n');
    }
}
//# sourceMappingURL=advisor-command.js.map