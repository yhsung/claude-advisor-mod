import { describe, it, expect } from 'vitest';
import { parseAdvisorResponse } from '../src/pruner/prompt-templates.js';

describe('Prompt Templates & JSON Parser', () => {
  it('parses clean JSON response', () => {
    const raw = JSON.stringify({
      verdict: 'warning',
      score: 6,
      confidence: 0.9,
      category: 'bug',
      summary: 'Missing null check in handler',
      feedback: ['Line 45 does not check for undefined'],
      suggestedAction: 'Add optional chaining or guard check',
    });

    const parsed = parseAdvisorResponse(raw);
    expect(parsed.verdict).toBe('warning');
    expect(parsed.score).toBe(6);
    expect(parsed.confidence).toBe(0.9);
    expect(parsed.category).toBe('bug');
    expect(parsed.summary).toBe('Missing null check in handler');
    expect(parsed.feedback).toHaveLength(1);
    expect(parsed.suggestedAction).toBe('Add optional chaining or guard check');
  });

  it('parses JSON wrapped inside markdown code fences', () => {
    const raw = `Here is my technical assessment:
\`\`\`json
{
  "verdict": "pass",
  "score": 9,
  "confidence": 0.95,
  "category": "architecture",
  "summary": "Implementation is clean and sound.",
  "feedback": [],
  "suggestedAction": "Proceed to next step"
}
\`\`\`
Good job!`;

    const parsed = parseAdvisorResponse(raw);
    expect(parsed.verdict).toBe('pass');
    expect(parsed.score).toBe(9);
    expect(parsed.confidence).toBe(0.95);
    expect(parsed.summary).toBe('Implementation is clean and sound.');
  });

  it('handles invalid JSON gracefully with fallback', () => {
    const raw = 'Fatal error: unable to process input properly.';
    const parsed = parseAdvisorResponse(raw);

    expect(['warning', 'pass']).toContain(parsed.verdict);
    expect(parsed.rawResponse).toBe(raw);
  });
});
