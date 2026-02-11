import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import cors from 'cors';
import { WalletManager } from './core/walletManager.js';
import { fetchWithPayment } from './core/fetchWithPayment.js';
import config from './config.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = new Server(
  {
    name: 'x402-stacks-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const walletManager = new WalletManager(config.walletDbPath, config.encryptionSecret);

// Register tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'search_research_data',
        description: 'Search paid research database. Costs 0.002 STX per query. Returns academic research data.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query for research database',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'analyze_text',
        description: 'Analyze text sentiment and extract insights. Costs 0.005 STX per analysis.',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Text to analyze',
            },
          },
          required: ['text'],
        },
      },
      {
        name: 'get_market_data',
        description: 'Get real-time Stacks market data. Costs 0.001 STX per request.',
        inputSchema: {
          type: 'object',
          properties: {
            symbol: {
              type: 'string',
              description: 'Market symbol (e.g., STX)',
            },
          },
          required: ['symbol'],
        },
      },
      {
        name: 'translate_text',
        description: 'Translate text to another language. Costs 0.001 STX per translation.',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'Text to translate',
            },
            targetLanguage: {
              type: 'string',
              description: 'Target language code (e.g., es, fr, id)',
            },
          },
          required: ['text', 'targetLanguage'],
        },
      },
      {
        name: 'get_wallet_info',
        description: 'Get agent wallet address and balance',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  const userId = 'remote-agent';

  try {
    switch (name) {
      case 'search_research_data': {
        const apiUrl = `${config.researchApiUrl}/search?q=${encodeURIComponent(args.query)}`;
        const result = await fetchWithPayment(apiUrl, walletManager, userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'analyze_text': {
        const apiUrl = `${config.analysisApiUrl}/analyze`;
        const result = await fetchWithPayment(
          apiUrl,
          walletManager,
          userId,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: args.text }),
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_market_data': {
        const apiUrl = `${config.marketApiUrl}/market/${args.symbol}`;
        const result = await fetchWithPayment(apiUrl, walletManager, userId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'translate_text': {
        const apiUrl = `${config.translateApiUrl}/translate`;
        const result = await fetchWithPayment(
          apiUrl,
          walletManager,
          userId,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: args.text,
              targetLanguage: args.targetLanguage,
            }),
          }
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_wallet_info': {
        const wallet = await walletManager.getOrCreateWallet(userId);
        const balance = await walletManager.getBalance(wallet.address);
        const balanceSTX = Number(balance) / 1_000_000;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  userId,
                  address: wallet.address,
                  balanceMicroSTX: balance.toString(),
                  balanceSTX: balanceSTX.toFixed(6),
                  network: config.stacksNetwork,
                  faucetUrl:
                    config.stacksNetwork === 'testnet'
                      ? `https://explorer.hiro.so/sandbox/faucet?chain=testnet&address=${wallet.address}`
                      : null,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// SSE endpoint for MCP
app.get('/sse', async (req, res) => {
  const transport = new SSEServerTransport('/message', res);
  await server.connect(transport);
});

// Message endpoint for MCP
app.post('/message', async (req, res) => {
  // Handle MCP messages
  res.json({ ok: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'x402-stacks-mcp-server' });
});

// Info endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'x402-stacks MCP Server',
    version: '1.0.0',
    description: 'MCP server with autonomous STX payments for API access',
    endpoints: {
      sse: '/sse',
      message: '/message',
      health: '/health',
    },
    tools: [
      'search_research_data',
      'analyze_text',
      'get_market_data',
      'translate_text',
      'get_wallet_info',
    ],
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 x402-stacks MCP HTTP Server running on port ${PORT}`);
  console.log(`📡 SSE endpoint: http://localhost:${PORT}/sse`);
  console.log(`💬 Message endpoint: http://localhost:${PORT}/message`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
