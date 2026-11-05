import { describe, it, expect } from 'vitest';
import { truncateMiddle, stripBinaryBlobs, pruneContext } from '../src/pruner/context-pruner.js';

describe('Context Pruner', () => {
  it('truncates middle of long string preserving head and tail', () => {
    const longStr = 'HEAD_' + 'A'.repeat(500) + '_TAIL';
    const truncated = truncateMiddle(longStr, 100);

    expect(truncated).toContain('HEAD_');
    expect(truncated).toContain('_TAIL');
    expect(truncated).toContain('omitted');
    expect(truncated.length).toBeLessThan(longStr.length);
  });

  it('keeps short text intact', () => {
    const shortStr = 'Hello World';
    expect(truncateMiddle(shortStr, 50)).toBe(shortStr);
  });

  it('strips base64 image blobs and long hex hashes', () => {
    const input = 'Image: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA' + 'A'.repeat(100) + ' and hash ' + 'f'.repeat(150);
    const cleaned = stripBinaryBlobs(input);

    expect(cleaned).toContain('[base64 image/binary omitted]');
    expect(cleaned).toContain('[hex hash/blob omitted]');
    expect(cleaned).not.toContain('iVBORw0KGgoAAAANSUhEUgAAAAUA');
  });

  it('prunes full GateContext into structured markdown sections', () => {
    const pruned = pruneContext({
      userPrompt: 'Implement advisor model',
      currentTask: 'Drafting gate evaluator',
      toolName: 'bash',
      toolArgs: { command: 'npm test' },
      toolResult: 'npm error test failed with code 1',
      consecutiveErrorCount: 2,
      gitDiff: 'diff --git a/file b/file\n+new line',
      recentTurns: [
        { role: 'user', content: 'Start task' },
        { role: 'assistant', content: 'Running command' },
      ],
    });

    expect(pruned).toContain('### Original User Goal / Prompt:');
    expect(pruned).toContain('Implement advisor model');
    expect(pruned).toContain('### Current Tool Invocation:');
    expect(pruned).toContain('Tool: bash');
    expect(pruned).toContain('npm error test failed with code 1');
    expect(pruned).toContain('Consecutive tool error count: 2');
    expect(pruned).toContain('### Current Git Diff / Changes:');
  });
});
