import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
export const DEFAULT_CONFIG = {
    mode: 'balanced',
    provider: 'anthropic',
    model: 'claude-3-7-sonnet-20250219',
    baseUrl: undefined,
    maxTokens: 2048,
    temperature: 0.2,
    confidenceThreshold: 0.75,
    maxUsesPerSession: 25,
    planningGateEnabled: true,
    errorLoopGateEnabled: true,
    errorThreshold: 2,
    preFinishGateEnabled: true,
};
const GLOBAL_CONFIG_DIR = path.join(os.homedir(), '.claude');
const GLOBAL_CONFIG_FILE = path.join(GLOBAL_CONFIG_DIR, 'advisor.json');
const LOCAL_CONFIG_FILE = path.join(process.cwd(), '.advisor.json');
/**
 * Loads configuration with precedence:
 * 1. Environment variables
 * 2. Local project config (.advisor.json)
 * 3. Global user config (~/.claude/advisor.json)
 * 4. Default config
 */
export function loadConfig() {
    let fileConfig = {};
    if (fs.existsSync(LOCAL_CONFIG_FILE)) {
        try {
            const content = fs.readFileSync(LOCAL_CONFIG_FILE, 'utf-8');
            fileConfig = JSON.parse(content);
        }
        catch {
            // ignore parse failure
        }
    }
    else if (fs.existsSync(GLOBAL_CONFIG_FILE)) {
        try {
            const content = fs.readFileSync(GLOBAL_CONFIG_FILE, 'utf-8');
            fileConfig = JSON.parse(content);
        }
        catch {
            // ignore parse failure
        }
    }
    const envMode = process.env.ADVISOR_MODE;
    const envProvider = process.env.ADVISOR_PROVIDER;
    const envModel = process.env.ADVISOR_MODEL;
    const envApiKey = process.env.ADVISOR_API_KEY ||
        (envProvider === 'openai' ? process.env.OPENAI_API_KEY :
            envProvider === 'gemini' ? (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) :
                process.env.ANTHROPIC_API_KEY);
    const envBaseUrl = process.env.ADVISOR_BASE_URL;
    const merged = {
        ...DEFAULT_CONFIG,
        ...fileConfig,
        ...(envMode ? { mode: envMode } : {}),
        ...(envProvider ? { provider: envProvider } : {}),
        ...(envModel ? { model: envModel } : {}),
        ...(envApiKey ? { apiKey: envApiKey } : {}),
        ...(envBaseUrl ? { baseUrl: envBaseUrl } : {}),
    };
    // If local-mlx is chosen and no baseUrl is specified, default to http://localhost:8080/v1
    if (merged.provider === 'local-mlx' && !merged.baseUrl) {
        merged.baseUrl = 'http://localhost:8080/v1';
    }
    return merged;
}
/**
 * Persists updated configuration to global or local config file
 */
export function saveConfig(updates, saveLocally = false) {
    const current = loadConfig();
    const nextConfig = { ...current, ...updates };
    const targetFile = saveLocally ? LOCAL_CONFIG_FILE : GLOBAL_CONFIG_FILE;
    const targetDir = path.dirname(targetFile);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(targetFile, JSON.stringify(nextConfig, null, 2), 'utf-8');
    return nextConfig;
}
// In-memory runtime session state
let currentSessionState = {
    consultationCount: 0,
    consecutiveToolErrors: 0,
    history: [],
};
export function getSessionState() {
    return currentSessionState;
}
export function resetSessionState() {
    currentSessionState = {
        consultationCount: 0,
        consecutiveToolErrors: 0,
        history: [],
    };
}
export function updateSessionState(updater) {
    const delta = updater(currentSessionState);
    currentSessionState = {
        ...currentSessionState,
        ...delta,
    };
    return currentSessionState;
}
//# sourceMappingURL=config.js.map