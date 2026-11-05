/**
 * Types and interfaces for claude-advisor-mod
 */

export type AdvisorMode = 'advisory' | 'balanced' | 'strict' | 'disabled';

export type ModelProviderType = 'anthropic' | 'openai' | 'gemini' | 'local-mlx';

export interface AdvisorConfig {
  /** Mode of intervention */
  mode: AdvisorMode;
  /** LLM Provider */
  provider: ModelProviderType;
  /** Model identifier */
  model: string;
  /** Optional API Key (defaults to env variables if unset) */
  apiKey?: string;
  /** Optional custom Base URL (e.g., http://localhost:8080/v1 for MLX) */
  baseUrl?: string;
  /** Maximum generation tokens */
  maxTokens?: number;
  /** Temperature for evaluation */
  temperature?: number;
  /** Minimum confidence (0.0 to 1.0) required to inject advice */
  confidenceThreshold: number;
  /** Maximum advisory invocations allowed per session to limit budget */
  maxUsesPerSession: number;
  /** Toggle planning gate on user prompt */
  planningGateEnabled: boolean;
  /** Toggle error loop detection gate */
  errorLoopGateEnabled: boolean;
  /** Consecutive errors before error gate triggers */
  errorThreshold: number;
  /** Toggle pre-finish review gate */
  preFinishGateEnabled: boolean;
  /** Path to local scratch or log directory */
  logDir?: string;
}

export type AdvisorVerdict = 'pass' | 'nit' | 'warning' | 'block';

export interface AdvisorEvaluationResult {
  verdict: AdvisorVerdict;
  confidence: number;
  score: number; // 1 to 10 rating of current state/plan
  category: 'architecture' | 'bug' | 'security' | 'testing' | 'redundancy' | 'alignment' | 'general';
  summary: string;
  feedback: string[];
  suggestedAction?: string;
  providerUsed?: string;
  modelUsed?: string;
  latencyMs?: number;
  rawResponse?: string;
}

export interface GateContext {
  userPrompt?: string;
  currentTask?: string;
  recentTurns?: Array<{ role: 'user' | 'assistant' | 'system' | 'tool'; content: string }>;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: string;
  gitDiff?: string;
  consecutiveErrorCount?: number;
  consultationQuestion?: string;
}

export interface HookOutput {
  continue: boolean;
  message?: string;
  injectedContext?: string;
}

export interface AdvisorSessionState {
  consultationCount: number;
  consecutiveToolErrors: number;
  lastToolFailed?: string;
  history: Array<{
    timestamp: number;
    trigger: string;
    verdict: AdvisorVerdict;
    summary: string;
  }>;
}
