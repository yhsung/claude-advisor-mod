import { loadConfig, saveConfig, getSessionState, resetSessionState } from '../config.js';
import { AdvisorMode, ModelProviderType } from '../types.js';
import { GateEvaluator } from '../gates/gate-evaluator.js';

export async function handleAdvisorCommand(args: string[]): Promise<string> {
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
      const nextMode: AdvisorMode = config.mode === 'disabled' ? 'balanced' : 'disabled';
      saveConfig({ mode: nextMode });
      return `Advisor is now ${nextMode === 'disabled' ? '🔴 DISABLED' : `🟢 ENABLED (${nextMode.toUpperCase()})`}`;
    }

    case 'mode': {
      const modeArg = args[1]?.toLowerCase() as AdvisorMode | undefined;
      const validModes: AdvisorMode[] = ['advisory', 'balanced', 'strict', 'disabled'];

      if (!modeArg || !validModes.includes(modeArg)) {
        return `Usage: /advisor mode <advisory|balanced|strict|disabled>. Current: ${config.mode}`;
      }

      saveConfig({ mode: modeArg });
      return `Advisor mode updated to: ${modeArg.toUpperCase()}`;
    }

    case 'provider': {
      const providerArg = args[1]?.toLowerCase() as ModelProviderType | undefined;
      const validProviders: ModelProviderType[] = ['anthropic', 'openai', 'gemini', 'local-mlx'];

      if (!providerArg || !validProviders.includes(providerArg)) {
        return `Usage: /advisor provider <anthropic|openai|gemini|local-mlx>. Current: ${config.provider}`;
      }

      saveConfig({ provider: providerArg });
      return `Advisor provider updated to: ${providerArg}`;
    }

    case 'model': {
      const modelArg = args.slice(1).join(' ').trim();
      if (!modelArg) {
        return `Usage: /advisor model <model-name>. Current model: ${config.model}`;
      }

      saveConfig({ model: modelArg });
      return `Advisor model updated to: ${modelArg}`;
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
        '  /advisor toggle               Toggle between active and disabled',
        '  /advisor mode <mode>          Set mode (advisory, balanced, strict, disabled)',
        '  /advisor provider <provider>  Set provider (anthropic, openai, gemini, local-mlx)',
        '  /advisor model <model>        Set target model',
        '  /advisor test [query]         Run an immediate diagnostic check',
        '  /advisor reset                Reset session counters',
      ].join('\n');
  }
}
