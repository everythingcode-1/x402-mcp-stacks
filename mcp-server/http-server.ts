import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import express from 'express';
import { WalletManager } from './core/walletManager.js';
import { fetchWithPayment } from './core/fetchWithPayment.js';
import { config } from './config.js';

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

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

const walletManager = new WalletManager();

// Register tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
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

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const userId = 'remote-agent';

  if (!args) {
    throw new Error('Missing arguments');
  }

  try {
    switch (name) {
      case 'search_research_data': {
        const apiUrl = `${config.services.researchApiUrl}/search?q=${encodeURIComponent(String(args.query))}`;
        const response = await fetchWithPayment(apiUrl, {}, { userId, walletManager });
        const result = await response.json();
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
        const apiUrl = `${config.services.analysisApiUrl}/analyze`;
        const response = await fetchWithPayment(
          apiUrl,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: String(args.text) }),
          },
          { userId, walletManager }
        );
        const result = await response.json();
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
        const apiUrl = `${config.services.marketApiUrl}/market/${String(args.symbol)}`;
        const response = await fetchWithPayment(apiUrl, {}, { userId, walletManager });
        const result = await response.json();
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
        const apiUrl = `${config.services.translateApiUrl}/translate`;
        const response = await fetchWithPayment(
          apiUrl,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: String(args.text),
              targetLanguage: String(args.targetLanguage),
            }),
          },
          { userId, walletManager }
        );
        const result = await response.json();
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
  console.log('SSE connection request received');
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const transport = new SSEServerTransport('/message', res);
  
  try {
    await server.connect(transport);
    console.log('MCP server connected via SSE');
  } catch (error) {
    console.error('SSE connection error:', error);
    res.status(500).end();
  }
});

// Message endpoint for MCP
app.post('/message', async (req, res) => {
  console.log('Message received:', req.body);
  res.setHeader('Access-Control-Allow-Origin', '*');
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
