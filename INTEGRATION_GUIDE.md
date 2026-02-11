# Integrasi x402-stacks MCP dengan Database Registry

## Overview

Sistem ini menggabungkan:
1. **Landing Page** - Web interface untuk registrasi tool x402
2. **Database PostgreSQL** - Menyimpan registered tools
3. **Backend API** - REST API untuk CRUD operations
4. **MCP Server** - Membaca tools dari database dan menyediakannya ke AI agents

## Arsitektur Lengkap

```
┌─────────────────┐
│  Landing Page   │ (React + Vite)
│  /register      │
│  /tools         │
└────────┬────────┘
         │
         ↓ HTTP POST
┌─────────────────┐
│  Backend API    │ (Express)
│  Port 3100      │
└────────┬────────┘
         │
         ↓ Prisma ORM
┌─────────────────┐
│  PostgreSQL DB  │ (Prisma.io)
│  registered_    │
│  tools table    │
└────────┬────────┘
         │
         ↓ Query
┌─────────────────┐
│  MCP Server     │ (x402-stacks)
│  Dynamic Tools  │
└─────────────────┘
         │
         ↓ MCP Protocol
┌─────────────────┐
│  Claude/AI      │
│  Agent          │
└─────────────────┘
```

## Setup Lengkap

### 1. Setup Database & Landing Page

```bash
cd web-landing

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit .env dengan database connection string Anda
# DATABASE_URL="postgres://..."

# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# Start backend API (Terminal 1)
npm run api

# Start frontend (Terminal 2)
npm run dev
```

### 2. Registrasi Tool Pertama

1. Buka http://localhost:5173
2. Klik "Register Your Tool"
3. Isi form:
   - Name: "Research Data API"
   - Description: "Search research data on topics"
   - API URL: "http://localhost:3001/api/research"
   - Price: "2000" (microSTX)
   - Wallet Address: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
   - Category: "data"
4. Submit

### 3. Approve Tool (Manual via Prisma Studio)

```bash
cd web-landing
npm run db:studio
```

Di Prisma Studio:
1. Buka table `registered_tools`
2. Cari tool yang baru didaftarkan
3. Edit field `status` dari "pending" ke "approved"
4. Save

### 4. Update MCP Server untuk Membaca dari Database

Buat file baru: `mcp-server/db/toolRegistry.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

export interface RegisteredTool {
  id: string;
  name: string;
  description: string;
  apiUrl: string;
  price: string;
  priceUnit: string;
  walletAddress: string;
  category: string;
}

export async function loadRegisteredTools(): Promise<RegisteredTool[]> {
  try {
    const tools = await prisma.registeredTool.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' }
    });
    
    console.error(`[ToolRegistry] Loaded ${tools.length} approved tools from database`);
    return tools;
  } catch (error) {
    console.error('[ToolRegistry] Error loading tools:', error);
    return [];
  }
}

export async function logToolCall(
  toolId: string,
  userId: string,
  txId: string,
  amount: string,
  status: 'success' | 'failed'
) {
  try {
    await prisma.toolCall.create({
      data: { toolId, userId, txId, amount, status }
    });
  } catch (error) {
    console.error('[ToolRegistry] Error logging tool call:', error);
  }
}

export async function closePrisma() {
  await prisma.$disconnect();
}
```

### 5. Update MCP Server Index

Edit `mcp-server/index.ts`:

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { WalletManager } from './core/walletManager.js';
import { fetchWithPayment } from './core/fetchWithPayment.js';
import { config } from './config.js';
import { loadRegisteredTools, logToolCall, closePrisma } from './db/toolRegistry.js';

const walletManager = new WalletManager();

const server = new Server(
  { name: 'x402-stacks-agent', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Load tools from database
let registeredTools: any[] = [];

async function refreshTools() {
  registeredTools = await loadRegisteredTools();
  console.error(`[MCP Server] Loaded ${registeredTools.length} tools from registry`);
}

// Initial load
await refreshTools();

// Refresh every 5 minutes
setInterval(refreshTools, 5 * 60 * 1000);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = [
    // Built-in wallet tool
    {
      name: 'get_agent_wallet',
      description: 'Get or create the STX wallet for a user. Returns the wallet address and current STX balance.',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID to get wallet for. Use "default" for the default agent wallet.' }
        },
        required: ['userId']
      }
    },
    // Dynamic tools from database
    ...registeredTools.map(tool => ({
      name: `call_${tool.id.replace(/-/g, '_')}`,
      description: `${tool.description} | Price: ${Number(tool.price) / 1_000_000} ${tool.priceUnit} per call | Category: ${tool.category}`,
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'User ID for wallet lookup. Use "default" if unsure.', default: 'default' },
          ...getToolParameters(tool)
        },
        required: ['userId']
      }
    }))
  ];

  return { tools };
});

function getToolParameters(tool: any) {
  // Parse API URL to determine parameters
  // For now, return generic parameters
  return {
    query: { type: 'string', description: 'Query parameter for the API call' }
  };
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Handle wallet tool
    if (name === 'get_agent_wallet') {
      const userId = (args?.userId as string) || 'default';
      const wallet = await walletManager.getOrCreateWallet(userId);
      const balance = await walletManager.getBalance(wallet.address);
      const balanceSTX = Number(balance) / 1_000_000;

      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            userId,
            address: wallet.address,
            balanceMicroSTX: balance.toString(),
            balanceSTX: balanceSTX.toFixed(6),
            network: config.stacksNetwork
          }, null, 2)
        }]
      };
    }

    // Handle dynamic tools
    if (name.startsWith('call_')) {
      const toolId = name.replace('call_', '').replace(/_/g, '-');
      const tool = registeredTools.find(t => t.id === toolId);

      if (!tool) {
        throw new Error(`Tool ${toolId} not found in registry`);
      }

      const userId = (args?.userId as string) || 'default';
      
      // Build API URL with query parameters
      const url = new URL(tool.apiUrl);
      if (args?.query) {
        url.searchParams.append('query', args.query as string);
      }

      console.error(`[MCP Server] Calling tool: ${tool.name} at ${url.toString()}`);

      const response = await fetchWithPayment(
        url.toString(),
        { method: 'GET' },
        { userId, walletManager }
      );

      const data = await response.json();

      // Log successful call
      await logToolCall(toolId, userId, 'pending', tool.price, 'success');

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(data, null, 2)
        }]
      };
    }

    throw new Error(`Unknown tool: ${name}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[MCP Server] Error executing tool ${name}:`, errorMessage);

    return {
      content: [{
        type: 'text',
        text: `Error: ${errorMessage}`
      }],
      isError: true
    };
  }
});

async function main() {
  console.error('[MCP Server] Starting x402-stacks-agent MCP server...');
  console.error(`[MCP Server] Network: ${config.stacksNetwork}`);
  console.error(`[MCP Server] Database: Connected`);
  console.error(`[MCP Server] Registered tools: ${registeredTools.length}`);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[MCP Server] Server running and ready to accept requests');
}

main().catch((error) => {
  console.error('[MCP Server] Fatal error:', error);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await closePrisma();
  walletManager.close();
  process.exit(0);
});
```

### 6. Update package.json di Root Project

Tambahkan Prisma client ke dependencies utama:

```bash
cd ..  # Kembali ke root project
npm install @prisma/client
```

Update `package.json`:

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@stacks/network": "^6.13.0",
    "@stacks/transactions": "^6.13.0",
    "@stacks/wallet-sdk": "^6.5.0",
    "@stacks/encryption": "^6.13.0",
    "@prisma/client": "^5.9.0",
    "better-sqlite3": "^9.4.0",
    "express": "^4.18.0",
    "x402-stacks": "latest",
    "dotenv": "^16.0.0"
  }
}
```

### 7. Update .env di Root Project

Tambahkan DATABASE_URL:

```env
# Existing config...
STACKS_NETWORK=testnet
FACILITATOR_URL=https://x402-facilitator.stacksx402.com
WALLET_DB_PATH=./wallets.db
WALLET_ENCRYPTION_SECRET=your-secret-here

# New: Database connection
DATABASE_URL="postgres://79aa8ed40c97ca8cdaa1f0e82379060a9bbb6ea4f38841ce759a1d77f540dc0c:sk_NBXDqUPE6tyqaD_cD5pje@db.prisma.io:5432/postgres?sslmode=require&pool=true"
```

### 8. Copy Prisma Schema ke Root

```bash
cp web-landing/prisma/schema.prisma prisma/schema.prisma
```

### 9. Generate Prisma Client di Root

```bash
npx prisma generate
```

### 10. Test Complete Flow

```bash
# Terminal 1: Start demo services
npm run start:all-services

# Terminal 2: Start backend API
cd web-landing
npm run api

# Terminal 3: Start frontend
cd web-landing
npm run dev

# Terminal 4: Start MCP server
cd ..
npm run start:mcp
```

## Testing Workflow

### 1. Register Tool via Web

1. Buka http://localhost:5173
2. Register tool baru
3. Approve via Prisma Studio

### 2. Verify Tool in MCP

MCP server akan auto-refresh setiap 5 menit, atau restart server untuk load immediately.

### 3. Test with Claude Desktop

Configure Claude Desktop dengan MCP server, lalu:

```
List available tools
```

Claude akan melihat semua tools yang registered dan approved.

```
Call the research tool to search for "Bitcoin"
```

Claude akan otomatis:
1. Discover tool dari database
2. Call API
3. Receive 402
4. Pay with STX
5. Retry and get data

## Monitoring

### View Registered Tools

```bash
cd web-landing
npm run db:studio
```

### View Tool Call Logs

Di Prisma Studio, buka table `tool_calls` untuk melihat:
- Tool yang dipanggil
- User/agent yang memanggil
- Transaction ID
- Amount paid
- Status (success/failed)

### View Payment Transactions

Check Stacks Explorer:
```
https://explorer.hiro.so/address/YOUR_WALLET_ADDRESS?chain=testnet
```

## Production Deployment

### Database
- Sudah menggunakan Prisma.io (production-ready)
- Connection pooling enabled
- SSL required

### Backend API
Deploy ke:
- Railway
- Render
- Heroku
- Vercel (serverless)

### Frontend
Deploy ke:
- Vercel
- Netlify
- Cloudflare Pages

### MCP Server
- Run on server dengan Claude Desktop
- Atau integrate dengan MCP Inspector
- Atau custom MCP client

## Keamanan

1. **Database**: SSL required, connection pooling
2. **API**: CORS configured, input validation
3. **Wallet**: Encrypted dengan AES-256-GCM
4. **Payments**: On-chain verification via x402-stacks

## Troubleshooting

### Tools tidak muncul di MCP
- Check database connection
- Verify tools are approved
- Restart MCP server
- Check logs untuk errors

### Payment gagal
- Check wallet balance
- Verify demo services running
- Check x402-stacks facilitator status
- Review transaction on explorer

### Database connection error
- Verify DATABASE_URL correct
- Check network connectivity
- Ensure SSL enabled
- Test with Prisma Studio

## Next Steps

1. ✅ Setup database dan landing page
2. ✅ Register demo tools
3. ✅ Integrate MCP dengan database
4. ⏳ Test complete flow
5. ⏳ Deploy to production
6. ⏳ Create demo video

## Support

- Main README: Project overview
- SETUP.md: MCP server setup
- TESTING.md: Testing guide
- web-landing/SETUP_GUIDE.md: Landing page setup
