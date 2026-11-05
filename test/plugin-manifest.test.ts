import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Plugin Manifest & Package Consistency', () => {
  it('validates plugin.json structure and required fields', () => {
    const pluginPath = path.join(process.cwd(), '.claude-plugin', 'plugin.json');
    expect(fs.existsSync(pluginPath)).toBe(true);

    const plugin = JSON.parse(fs.readFileSync(pluginPath, 'utf-8'));
    expect(plugin.name).toBe('claude-advisor-mod');
    expect(plugin.version).toBe('0.1.0');
    expect(plugin.entrypoint).toBe('dist/index.js');
    expect(plugin.hooks).toBeDefined();
    expect(plugin.hooks.PrePrompt).toBeDefined();
    expect(plugin.hooks.PostToolUse).toBeDefined();
    expect(plugin.hooks.Stop).toBeDefined();
    expect(plugin.mcpServers?.advisor).toBeDefined();
  });

  it('validates package.json exports and bin scripts', () => {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

    expect(pkg.name).toBe('claude-advisor-mod');
    expect(pkg.main).toBe('dist/index.js');
    expect(pkg.bin['claude-advisor-mcp']).toBe('dist/mcp/cli.js');
  });
});
