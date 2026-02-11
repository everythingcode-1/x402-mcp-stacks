import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { WalletManager } from './core/walletManager.js';
import { fetchWithPayment } from './core/fetchWithPayment.js';
import { config } from './config.js';

const walletManager = new WalletManager();

const server = new Server(
  { name: 'x402-stacks-agent', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'get_agent_wallet',
      description: 'Get or create the STX wallet for a user. Returns the wallet address and current STX balance.',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { 
            type: 'string', 
            description: 'User ID to get wallet for. Use "default" for the default agent wallet.' 
          }
        },
        required: ['userId']
      }
    },
    {
      name: 'search_research_data',
      description: 'Search for research data on a topic. Costs 0.002 STX per call. Automatically pays using agent wallet.',
      inputSchema: {
        type: 'object',
        properties: {
          topic: { 
            type: 'string', 
            description: 'The research topic to search for' 
          },
          userId: { 
            type: 'string', 
            description: 'User ID for wallet lookup. Use "default" if unsure.',
            default: 'default'
          }
        },
        required: ['topic']
      }
    },
    {
      name: 'analyze_text',
      description: 'Analyze sentiment and extract entities from text. Costs 0.005 STX per call. Automatically pays using agent wallet.',
      inputSchema: {
        type: 'object',
        properties: {
          text: { 
            type: 'string', 
            description: 'The text to analyze' 
          },
          userId: { 
            type: 'string', 
            description: 'User ID for wallet lookup. Use "default" if unsure.',
            default: 'default'
          }
        },
        required: ['text']
      }
    },
    {
      name: 'get_market_data',
      description: 'Get current market data for a Stacks ecosystem token. Costs 0.001 STX per call. Automatically pays using agent wallet.',
      inputSchema: {
        type: 'object',
        properties: {
          token: { 
            type: 'string', 
            description: 'Token symbol: STX, sBTC, or USDCx' 
          },
          userId: { 
            type: 'string', 
            description: 'User ID for wallet lookup. Use "default" if unsure.',
            default: 'default'
          }
        },
        required: ['token']
      }
    },
    {
      name: 'translate_text',
      description: 'Translate text to another language. Costs 0.001 STX per call. Automatically pays using agent wallet.',
      inputSchema: {
        type: 'object',
        properties: {
          text: { 
            type: 'string', 
            description: 'Text to translate' 
          },
          targetLang: { 
            type: 'string', 
            description: 'Target language code: id (Indonesian), es (Spanish), fr (French), ja (Japanese)' 
          },
          userId: { 
            type: 'string', 
            description: 'User ID for wallet lookup. Use "default" if unsure.',
            default: 'default'
          }
        },
        required: ['text', 'targetLang']
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_agent_wallet': {
        const userId = (args?.userId as string) || 'default';
        const wallet = await walletManager.getOrCreateWallet(userId);
        const balance = await walletManager.getBalance(wallet.address);
        const balanceSTX = Number(balance) / 1_000_000;

        const result = {
          userId,
          address: wallet.address,
          balanceMicroSTX: balance.toString(),
          balanceSTX: balanceSTX.toFixed(6),
          network: config.stacksNetwork,
          faucetUrl: config.stacksNetwork === 'testnet' 
            ? `https://explorer.hiro.so/sandbox/faucet?chain=testnet&address=${wallet.address}`
            : null
        };

        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(result, null, 2) 
            }
          ]
        };
      }

      case 'search_research_data': {
        const topic = args?.topic as string;
        const userId = (args?.userId as string) || 'default';

        if (!topic) {
          throw new Error('Missing required parameter: topic');
        }

        const url = `${config.services.researchApiUrl}/api/research?topic=${encodeURIComponent(topic)}`;
        
        const response = await fetchWithPayment(
          url,
          { method: 'GET' },
          { userId, walletManager }
        );

        const data = await response.json();

        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(data, null, 2) 
            }
          ]
        };
      }

      case 'analyze_text': {
        const text = args?.text as string;
        const userId = (args?.userId as string) || 'default';

        if (!text) {
          throw new Error('Missing required parameter: text');
        }

        const url = `${config.services.analysisApiUrl}/api/analyze`;
        
        const response = await fetchWithPayment(
          url,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
          },
          { userId, walletManager }
        );

        const data = await response.json();

        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(data, null, 2) 
            }
          ]
        };
      }

      case 'get_market_data': {
        const token = args?.token as string;
        const userId = (args?.userId as string) || 'default';

        if (!token) {
          throw new Error('Missing required parameter: token');
        }

        const url = `${config.services.marketApiUrl}/api/market?token=${encodeURIComponent(token)}`;
        
        const response = await fetchWithPayment(
          url,
          { method: 'GET' },
          { userId, walletManager }
        );

        const data = await response.json();

        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(data, null, 2) 
            }
          ]
        };
      }

      case 'translate_text': {
        const text = args?.text as string;
        const targetLang = args?.targetLang as string;
        const userId = (args?.userId as string) || 'default';

        if (!text || !targetLang) {
          throw new Error('Missing required parameters: text and targetLang');
        }

        const url = `${config.services.translateApiUrl}/api/translate`;
        
        const response = await fetchWithPayment(
          url,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, targetLang })
          },
          { userId, walletManager }
        );

        const data = await response.json();

        return {
          content: [
            { 
              type: 'text', 
              text: JSON.stringify(data, null, 2) 
            }
          ]
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[MCP Server] Error executing tool ${name}:`, errorMessage);
    
    return {
      content: [
        { 
          type: 'text', 
          text: `Error: ${errorMessage}` 
        }
      ],
      isError: true
    };
  }
});

async function main() {
  console.error('[MCP Server] Starting x402-stacks-agent MCP server...');
  console.error(`[MCP Server] Network: ${config.stacksNetwork}`);
  console.error(`[MCP Server] Facilitator: ${config.facilitatorUrl}`);
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('[MCP Server] Server running and ready to accept requests');
}

main().catch((error) => {
  console.error('[MCP Server] Fatal error:', error);
  process.exit(1);
});
