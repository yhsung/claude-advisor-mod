import { execSync } from 'node:child_process';
import { truncateMiddle } from './context-pruner.js';
/**
 * Extracts git status and diff cleanly
 */
export function extractGitDiff(options = {}) {
    const cwd = options.cwd || process.cwd();
    const maxChars = options.maxChars ?? 3500;
    try {
        // Check if inside a git repository
        execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: 'ignore' });
    }
    catch {
        return ''; // Not a git repository
    }
    try {
        const status = execSync('git status --short', { cwd, encoding: 'utf-8', timeout: 3000 }).trim();
        if (!status) {
            return 'No uncommitted git changes (working tree clean).';
        }
        const diff = execSync('git diff -U2 --stat && git diff -U2', { cwd, encoding: 'utf-8', timeout: 5000 }).trim();
        const output = `[Git Status]\n${status}\n\n[Diff Summary & Content]\n${diff}`;
        return truncateMiddle(output, maxChars);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return `[Git Diff Error]: ${msg}`;
    }
}
//# sourceMappingURL=diff-extractor.js.map