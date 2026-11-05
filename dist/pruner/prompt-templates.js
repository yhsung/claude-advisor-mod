export const ADVISOR_SYSTEM_PROMPT = `You are the Claude Code Advisor & Watchdog, an autonomous secondary reviewer model working alongside the primary coding agent.
Your mission is to provide concise, high-signal, over-the-shoulder technical review, catch blind spots, detect error loops, and prevent regressions.

EVALUATION CRITERIA:
1. Alignment: Does the agent's action/plan directly fulfill the user's intent without hallucination or scope creep?
2. Soundness: Are algorithms, file changes, commands, and logic correct? Are edge cases covered?
3. Error Loops: If tools or tests failed repeatedly, why did they fail? Is the agent treating symptoms instead of root causes?
4. Integrity: Are tests broken? Are there unsaved side-effects, missing exports, or destructive operations?

DECISION VERDICTS:
- "pass": Everything is progressing well. No action needed. Be quiet.
- "nit": Minor style or trivial improvements that can wait.
- "warning": Potential bug, logic hole, missing requirement, or loop detected. Course-correction recommended.
- "block": Critical failure, data loss risk, infinite loop, or violation of core constraints. Execution must pause or pivot immediately.

OUTPUT FORMAT REQUIREMENTS:
You MUST respond with ONLY a single valid JSON object adhering to the schema below. Do NOT output any markdown commentary outside the JSON block.

JSON Schema:
{
  "verdict": "pass" | "nit" | "warning" | "block",
  "score": number (1 to 10),
  "confidence": number (0.0 to 1.0),
  "category": "architecture" | "bug" | "security" | "testing" | "redundancy" | "alignment" | "general",
  "summary": "1-sentence executive verdict",
  "feedback": [
    "Specific observation 1 with file/line/command reference",
    "Specific observation 2"
  ],
  "suggestedAction": "Concrete next step or fix for the primary agent"
}`;
/**
 * Extracts and parses the structured JSON evaluation result from model output
 */
export function parseAdvisorResponse(rawText) {
    const cleaned = rawText.trim();
    // Try to find JSON inside markdown code fences or raw object
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || cleaned.match(/(\{[\s\S]*\})/);
    const targetStr = jsonMatch ? jsonMatch[1] : cleaned;
    try {
        const parsed = JSON.parse(targetStr);
        const verdict = ['pass', 'nit', 'warning', 'block'].includes(parsed.verdict)
            ? parsed.verdict
            : 'warning';
        return {
            verdict,
            score: typeof parsed.score === 'number' ? Math.max(1, Math.min(10, parsed.score)) : 7,
            confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(1, parsed.confidence)) : 0.8,
            category: parsed.category || 'general',
            summary: parsed.summary || 'Advisor evaluation completed.',
            feedback: Array.isArray(parsed.feedback) ? parsed.feedback.map(String) : [],
            suggestedAction: parsed.suggestedAction || undefined,
            rawResponse: rawText,
        };
    }
    catch {
        // Graceful fallback if model failed to output strict JSON
        return {
            verdict: cleaned.toLowerCase().includes('error') || cleaned.toLowerCase().includes('block') ? 'warning' : 'pass',
            score: 6,
            confidence: 0.6,
            category: 'general',
            summary: 'Advisor provided non-JSON feedback.',
            feedback: [cleaned.slice(0, 300)],
            rawResponse: rawText,
        };
    }
}
//# sourceMappingURL=prompt-templates.js.map