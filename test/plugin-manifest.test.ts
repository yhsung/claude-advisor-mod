import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Plugin Manifest & Package Consistency', () => {
  it('validates plugin.json structure and required fields', () => {
    const pluginPath = path.join(process.cwd(), '.claude-plugin', 'plugin.json');
    expect(fs.existsSync(pluginPath)).toBe(true);

    const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf-8'));
    expect(plugin.name).toBe('advisor-mod');
    expect(plugin.version).toBe('0.1.0');

    const hooksPath = path.join(process.cwd(), 'hooks', 'hooks.json');
    expect(fs.existsSync(hooksPath)).toBe(true);

    const hooksConfig = JSON.parse(fs.readFileSync(hooksPath, 'utf-8'));
    expect(hooksConfig.hooks?.UserPromptSubmit).toBeDefined();
    expect(hooksConfig.hooks?.PostToolUse).toBeDefined();
    expect(hooksConfig.hooks?.Stop).toBeDefined();
  });

  it('validates package.json exports and bin scripts', () => {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    expect(pkg.name).toBe('claude-advisor-mod');
    expect(pkg.main).toBe('dist/index.js');
    expect(pkg.bin['claude-advisor-mcp']).toBe('dist/mcp/cli.js');
  });
});
