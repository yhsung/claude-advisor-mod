#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createAdvisorMcpServer } from './advisor-server.js';

async function main(): Promise<void> {
  const server = createAdvisorMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err: unknown) => {
  const msg = err instanceof Error ? err.stack || err.message : String(err);
  console.error(`[claude-advisor-mcp] Fatal error: ${msg}`);
  process.exit(1);
});
