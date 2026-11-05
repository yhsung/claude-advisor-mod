import { describe, it, expect } from 'vitest';
import { createAdvisorMcpServer } from '../src/mcp/advisor-server.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

describe('Advisor MCP Server', () => {
  it('creates server and lists consult_advisor and advisor_status tools', async () => {
    const server = createAdvisorMcpServer();
    expect(server).toBeDefined();

    // Verify request handler registration
    // We can call the registered handler directly or inspect tools
    const handlers = (server as any)._requestHandlers;
    expect(handlers.has(ListToolsRequestSchema.shape.method.value)).toBe(true);

    const listHandler = handlers.get(ListToolsRequestSchema.shape.method.value);
    const result = await listHandler({ method: 'tools/list' }, {});

    expect(result.tools).toHaveLength(2);
    const toolNames = result.tools.map((t: any) => t.name);
    expect(toolNames).toContain('consult_advisor');
    expect(toolNames).toContain('advisor_status');
  });
});
