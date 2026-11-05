import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig, getSessionState } from '../config.js';
import { GateEvaluator } from '../gates/gate-evaluator.js';
export function createAdvisorMcpServer() {
    const server = new Server({
        name: 'claude-advisor-mcp',
        version: '0.1.0',
    }, {
        capabilities: {
            tools: {},
        },
    });
    const tools = [
        {
            name: 'consult_advisor',
            description: 'Consult the secondary high-intelligence advisor model for architectural review, code critique, or debugging assistance.',
            inputSchema: {
                type: 'object',
                properties: {
                    question: {
                        type: 'string',
                        description: 'The specific question, architectural doubt, or dilemma to ask the advisor.',
                    },
                    draftPlan: {
                        type: 'string',
                        description: 'Your proposed solution, design plan, or pseudo-code (if any).',
                    },
                    codeSnippet: {
                        type: 'string',
                        description: 'Relevant code snippet or diff to be reviewed.',
                    },
                    context: {
                        type: 'string',
                        description: 'Additional context or requirements.',
                    },
                },
                required: ['question'],
            },
        },
        {
            name: 'advisor_status',
            description: 'Check the current configuration, mode, and session metrics of the Claude Advisor watchdog.',
            inputSchema: {
                type: 'object',
                properties: {},
            },
        },
    ];
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return { tools };
    });
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        const config = loadConfig();
        if (name === 'advisor_status') {
            const state = getSessionState();
            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify({
                            mode: config.mode,
                            provider: config.provider,
                            model: config.model,
                            confidenceThreshold: config.confidenceThreshold,
                            consultationCount: state.consultationCount,
                            consecutiveToolErrors: state.consecutiveToolErrors,
                            maxUsesPerSession: config.maxUsesPerSession,
                            recentHistoryCount: state.history.length,
                        }, null, 2),
                    },
                ],
            };
        }
        if (name === 'consult_advisor') {
            const question = String(args?.question || '');
            const draftPlan = args?.draftPlan ? String(args.draftPlan) : undefined;
            const codeSnippet = args?.codeSnippet ? String(args.codeSnippet) : undefined;
            const extraContext = args?.context ? String(args.context) : undefined;
            const gateContext = {
                consultationQuestion: question,
                currentTask: draftPlan,
                toolResult: codeSnippet,
                userPrompt: extraContext,
            };
            const evaluator = new GateEvaluator(config);
            const result = await evaluator.evaluateGate('on_demand', gateContext);
            if (!result) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Advisor is currently disabled or exceeded session budget limit.',
                        },
                    ],
                };
            }
            const formatted = [
                `### Advisor Evaluation (${result.verdict.toUpperCase()})`,
                `- Category: ${result.category}`,
                `- Score: ${result.score}/10`,
                `- Confidence: ${Math.round(result.confidence * 100)}%`,
                `- Model: ${result.modelUsed || config.model} (${result.providerUsed || config.provider})`,
                '',
                `#### Executive Summary`,
                result.summary,
                '',
                result.feedback.length > 0 ? `#### Detailed Critique\n${result.feedback.map((f) => `- ${f}`).join('\n')}\n` : '',
                result.suggestedAction ? `#### Suggested Action\n${result.suggestedAction}` : '',
            ]
                .filter(Boolean)
                .join('\n');
            return {
                content: [
                    {
                        type: 'text',
                        text: formatted,
                    },
                ],
            };
        }
        throw new Error(`Unknown tool: ${name}`);
    });
    return server;
}
//# sourceMappingURL=advisor-server.js.map