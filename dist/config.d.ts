import { AdvisorConfig, AdvisorSessionState } from './types.js';
export declare const DEFAULT_CONFIG: AdvisorConfig;
/**
 * Loads configuration with precedence:
 * 1. Environment variables
 * 2. Local project config (.advisor.json)
 * 3. Global user config (~/.claude/advisor.json)
 * 4. Default config
 */
export declare function loadConfig(): AdvisorConfig;
/**
 * Persists updated configuration to global or local config file
 */
export declare function saveConfig(updates: Partial<AdvisorConfig>, saveLocally?: boolean): AdvisorConfig;
export declare function getSessionState(): AdvisorSessionState;
export declare function resetSessionState(): void;
export declare function updateSessionState(updater: (prev: AdvisorSessionState) => Partial<AdvisorSessionState>): AdvisorSessionState;
//# sourceMappingURL=config.d.ts.map