# x402-stacks MCP Server

An MCP (Model Context Protocol) server that enables AI agents (Claude) to autonomously discover and pay for API services using STX on the Stacks blockchain via the x402-stacks protocol.

**Hackathon:** x402 Stacks Challenge 2026  
**Deadline:** February 16, 2026  
**Core idea:** For the first time, an AI model can pay for what it needs using Bitcoin-secured STX — without asking permission.

---

## What This Does

When Claude needs data or a service, it calls a tool from this MCP server. The MCP server hits a paid API protected by `x402-stacks`. The API returns HTTP 402. The MCP server automatically pays from its STX wallet, retries the request, and returns the result to Claude. Claude never sees the payment — it just gets the answer.

**Flow:**
```
Claude → calls MCP tool
       → MCP hits paid API
       → API returns 402 + payment requirements
       → MCP pays STX from agent wallet
       → API verifies payment via x402-stacks facilitator
       → API returns data
       → MCP returns data to Claude
```

---

## Project Structure

```
x402-mcp/
├── mcp-server/
│   ├── index.ts              ← MCP Server entry point
│   ├── tools/
│   │   ├── searchData.ts     ← Tool: search paid research data
│   │   ├── analyzeText.ts    ← Tool: paid text analysis
│   │   ├── getMarketData.ts  ← Tool: paid Stacks market data
│   │   └── translateText.ts  ← Tool: paid translation service
│   ├── core/
│   │   ├── fetchWithPayment.ts  ← x402 payment cycle handler (CRITICAL)
│   │   └── walletManager.ts     ← Agent wallet: create, store, sign, send STX
│   └── config.ts             ← Environment config
│
├── demo-services/            ← Three demo APIs protected by x402-stacks
│   ├── research-api/
│   │   └── server.ts         ← Research data API (protected, 0.002 STX/call)
│   ├── analysis-api/
│   │   └── server.ts         ← Text analysis API (protected, 0.005 STX/call)
│   ├── market-api/
│   │   └── server.ts         ← Market data API (protected, 0.001 STX/call)
│   └── translate-api/
│       └── server.ts         ← Translation API (protected, 0.001 STX/call)
│
├── .env.example
├── package.json
└── README.md
```

---

## Tech Stack

- **MCP SDK:** `@modelcontextprotocol/sdk` — Anthropic's official MCP framework
- **Payment Protocol:** `x402-stacks` — npm package by tony1908 for x402 on Stacks
- **Stacks SDK:** `@stacks/transactions` + `@stacks/network` — for signing and sending STX
- **Wallet Storage:** `better-sqlite3` — local SQLite for per-user wallet persistence
- **Server Framework:** `express` — for demo API services
- **Language:** TypeScript

---

## Installation

```bash
# Install all dependencies
npm install @modelcontextprotocol/sdk
npm install x402-stacks
npm install @stacks/transactions @stacks/network @stacks/encryption
npm install better-sqlite3
npm install express
npm install @types/better-sqlite3 @types/express typescript ts-node --save-dev
```

---

## Environment Variables

Create `.env` in the root:

```env
# Stacks Network: "testnet" for development, "mainnet" for production
STACKS_NETWORK=testnet

# The x402-stacks facilitator URL (use their official one)
FACILITATOR_URL=https://x402-facilitator.stacksx402.com

# Path to SQLite database for wallet storage
WALLET_DB_PATH=./wallets.db

# Encryption secret for storing private keys (use a long random string)
WALLET_ENCRYPTION_SECRET=your-very-long-random-secret-string-here-minimum-32-chars

# Demo service URLs (when running locally)
RESEARCH_API_URL=http://localhost:3001
ANALYSIS_API_URL=http://localhost:3002
MARKET_API_URL=http://localhost:3003
TRANSLATE_API_URL=http://localhost:3004
```

---

## PART 1: Wallet Manager

**File:** `mcp-server/core/walletManager.ts`

This is the most critical security component. Each user (identified by a userId string) gets their own Stacks wallet. Private keys are encrypted with AES before storage. The wallet can send STX autonomously to pay for x402 services.

**What it must do:**
1. Create a new Stacks wallet (generate mnemonic + derive private key + get STX address)
2. Encrypt the private key using `WALLET_ENCRYPTION_SECRET` before saving
3. Store in SQLite: `(userId TEXT PRIMARY KEY, encryptedPrivateKey TEXT, stxAddress TEXT, createdAt TEXT)`
4. Load wallet by userId — decrypt and return private key in memory only
5. Sign and broadcast STX transfer transactions using `@stacks/transactions`
6. Check STX balance using Stacks API: `GET https://api.testnet.hiro.so/v2/accounts/{address}`

**Implementation guide:**

```typescript
import { makeSTXTokenTransfer, broadcastTransaction, AnchorMode, PostConditionMode } from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { generateSecretKey, generateWallet } from '@stacks/wallet-sdk';
import Database from 'better-sqlite3';
import * as crypto from 'crypto';

// Database schema - run once on startup
// CREATE TABLE IF NOT EXISTS agent_wallets (
//   userId TEXT PRIMARY KEY,
//   encryptedPrivateKey TEXT NOT NULL,
//   stxAddress TEXT NOT NULL,
//   createdAt TEXT NOT NULL
// )

// Encryption: use AES-256-GCM
// Key: crypto.scryptSync(WALLET_ENCRYPTION_SECRET, 'x402-salt', 32)
// Store as: iv:authTag:encryptedData (all hex)

// Wallet creation flow:
// 1. generateSecretKey() → mnemonic
// 2. generateWallet({ secretKey: mnemonic, password: '' }) → wallet
// 3. wallet.accounts[0].stxPrivateKey → private key
// 4. getAddressFromPrivateKey(privateKey, network) → STX address
// 5. Encrypt privateKey → store in DB

// STX Transfer for paying x402:
// makeSTXTokenTransfer({
//   recipient: recipientAddress,    // from 402 payment requirements
//   amount: microSTXAmount,         // parsed from payment requirements
//   senderKey: privateKey,
//   network: new StacksTestnet(),
//   anchorMode: AnchorMode.Any,
//   postConditionMode: PostConditionMode.Allow,
//   fee: 200n,                      // set low fee for micropayments
// })
// then broadcastTransaction(tx, network) → returns txId

export class WalletManager {
  // createWallet(userId: string): Promise<{ address: string }>
  // getWallet(userId: string): Promise<{ privateKey: string, address: string } | null>
  // getOrCreateWallet(userId: string): Promise<{ privateKey: string, address: string }>
  // getBalance(address: string): Promise<bigint>  // returns microSTX
  // sendSTX(userId: string, recipient: string, microSTXAmount: bigint): Promise<string>  // returns txId
}
```

**Critical security rules:**
- NEVER log or expose private keys anywhere
- NEVER store unencrypted private keys on disk
- Private keys only exist decrypted in memory during the duration of a transaction
- Each userId maps to exactly one wallet — if userId already has wallet, return existing one
- userId for MCP context: use a stable identifier from the MCP session or a config value

---

## PART 2: fetchWithPayment — The x402 Payment Cycle

**File:** `mcp-server/core/fetchWithPayment.ts`

This function is the heart of the project. It wraps any HTTP request with automatic x402 payment handling. When it hits a 402 response, it reads the payment requirements, pays using the agent wallet, and retries.

**What the x402-stacks 402 response body looks like** (based on their documentation):

```json
{
  "error": "payment_required",
  "paymentRequirements": {
    "payTo": "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    "amount": "2000",
    "tokenType": "STX",
    "network": "stacks:1",
    "facilitatorUrl": "https://x402-facilitator.stacksx402.com",
    "scheme": "exact"
  }
}
```

**What the payment header must look like when retrying:**

The x402-stacks facilitator expects a `payment-signature` header (lowercase) containing the Stacks transaction ID after it has been broadcast. Check the x402-stacks source code at `github.com/tony1908/x402-stacks` to confirm the exact header name and format they expect — it may be `payment-signature` or `x-payment` or `X-Payment-Signature`.

**Implementation guide:**

```typescript
interface PaymentRequirements {
  payTo: string;
  amount: string;        // microSTX as string
  tokenType: string;     // "STX" | "sBTC" | "USDCx"
  network: string;       // "stacks:1" for mainnet, "stacks:2147483648" for testnet
  facilitatorUrl: string;
  scheme: string;
}

interface FetchWithPaymentOptions {
  userId: string;           // to load the correct wallet
  walletManager: WalletManager;
  maxRetries?: number;      // default: 3
  waitForConfirmation?: boolean;  // default: false for speed
}

async function fetchWithPayment(
  url: string,
  fetchOptions: RequestInit,
  paymentOptions: FetchWithPaymentOptions
): Promise<Response>

// Logic:
// 1. Make initial request (standard fetch)
// 2. If response.status !== 402, return response immediately
// 3. Parse response body as JSON, extract paymentRequirements
// 4. Validate tokenType === "STX" (for MVP, only support STX)
// 5. Check wallet balance >= amount (throw helpful error if insufficient)
// 6. Call walletManager.sendSTX(userId, payTo, BigInt(amount))
// 7. Get txId from broadcast result
// 8. Wait briefly (1-2 seconds) for transaction to propagate
// 9. Retry original request with header: { 'payment-signature': txId }
// 10. If still 402 (payment not verified yet), wait and retry up to maxRetries
// 11. Log each payment: console.error(`[x402] Paid ${amount} microSTX to ${payTo} | tx: ${txId}`)
// 12. Return successful response
```

**Important:** Use `console.error` not `console.log` for all MCP server logging. MCP uses stdout for protocol communication — any console.log will corrupt the MCP stream. Always use stderr (console.error) for debug output.

---

## PART 3: Demo API Services

These are simple Express servers protected by `x402-stacks` `paymentMiddleware`. They simulate real paid services.

### How x402-stacks paymentMiddleware works (from their docs)

```typescript
import { paymentMiddleware } from 'x402-stacks';

const gate = paymentMiddleware({
  payTo: process.env.SERVICE_WALLET_ADDRESS,  // wallet that receives payments
  amount: "2000",           // amount in microSTX (2000 = 0.002 STX)
  tokenType: "STX",
  network: "stacks:2147483648",   // testnet CAIP-2 format
  facilitatorUrl: "https://x402-facilitator.stacksx402.com",
  scheme: "exact",
  maxTimeoutSeconds: 300,
});

app.get('/api/data', gate, (req, res) => {
  res.json({ data: "paid content here" });
});
```

### Research API — `demo-services/research-api/server.ts`

Port: 3001  
Price: 2000 microSTX (0.002 STX) per call  
Protected endpoint: `GET /api/research?topic={topic}`  

Returns mock research data:
```json
{
  "topic": "bitcoin layer 2",
  "articles": [
    {
      "title": "Lightning Network reaches 10,000 nodes",
      "summary": "The Lightning Network has achieved a new milestone...",
      "source": "Bitcoin Magazine",
      "date": "2026-02-10"
    },
    {
      "title": "Stacks Nakamoto upgrade improves finality",
      "summary": "The latest Stacks upgrade brings Bitcoin finality...",
      "source": "Stacks Blog", 
      "date": "2026-02-08"
    }
  ],
  "timestamp": "2026-02-11T10:00:00Z"
}
```

### Analysis API — `demo-services/analysis-api/server.ts`

Port: 3002  
Price: 5000 microSTX (0.005 STX) per call  
Protected endpoint: `POST /api/analyze` with body `{ text: string }`  

Returns mock analysis:
```json
{
  "sentiment": "positive",
  "confidence": 0.87,
  "entities": ["Bitcoin", "Stacks", "Lightning Network"],
  "summary": "The text discusses positive developments in Bitcoin scaling solutions.",
  "wordCount": 142
}
```

### Market API — `demo-services/market-api/server.ts`

Port: 3003  
Price: 1000 microSTX (0.001 STX) per call  
Protected endpoint: `GET /api/market?token={token}`  

Returns mock market data:
```json
{
  "token": "STX",
  "priceUSD": 1.24,
  "change24h": "+3.2%",
  "volume24h": "45,230,000",
  "marketCap": "1,820,000,000",
  "source": "x402-market-oracle",
  "timestamp": "2026-02-11T10:00:00Z"
}
```

### Translate API — `demo-services/translate-api/server.ts`

Port: 3004  
Price: 1000 microSTX (0.001 STX) per call  
Protected endpoint: `POST /api/translate` with body `{ text: string, targetLang: string }`  

Returns:
```json
{
  "originalText": "Bitcoin is the future of money",
  "translatedText": "Bitcoin adalah masa depan uang",
  "targetLang": "id",
  "confidence": 0.95
}
```

**Important for all demo services:** Each service needs its own STX wallet address in `.env` to receive payments. Generate four separate testnet wallets and put their addresses in the service environment variables. These are the recipient wallets — they do not need to sign transactions, just receive.

---

## PART 4: MCP Server Tools

**File:** `mcp-server/index.ts`

This is where everything connects. Use `@modelcontextprotocol/sdk/server` to create the MCP server and register tools.

### MCP Server Setup Pattern

```typescript
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

const server = new Server(
  { name: 'x402-stacks-agent', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Register tool list
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'search_research_data',
      description: 'Search for research data on a topic. Costs 0.002 STX per call. Automatically pays using agent wallet.',
      inputSchema: {
        type: 'object',
        properties: {
          topic: { type: 'string', description: 'The research topic to search for' },
          userId: { type: 'string', description: 'User ID for wallet lookup. Use "default" if unsure.' }
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
          text: { type: 'string', description: 'The text to analyze' },
          userId: { type: 'string', description: 'User ID for wallet lookup. Use "default" if unsure.' }
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
          token: { type: 'string', description: 'Token symbol: STX, sBTC, or USDCx' },
          userId: { type: 'string', description: 'User ID for wallet lookup. Use "default" if unsure.' }
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
          text: { type: 'string', description: 'Text to translate' },
          targetLang: { type: 'string', description: 'Target language code: id (Indonesian), es (Spanish), fr (French), ja (Japanese)' },
          userId: { type: 'string', description: 'User ID for wallet lookup. Use "default" if unsure.' }
        },
        required: ['text', 'targetLang']
      }
    },
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
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  // route to individual tool handlers
  // each handler calls fetchWithPayment() which handles x402 automatically
  // wrap in try/catch and return { content: [{ type: 'text', text: JSON.stringify(result) }] }
});

// Start server
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Tool: `get_agent_wallet`

This tool is important for the demo. It lets the user (or Claude) check what wallet the agent is using and what its balance is before starting paid operations. Call `walletManager.getOrCreateWallet(userId)` and `walletManager.getBalance(address)`. Return the STX address and balance in STX (divide microSTX by 1,000,000).

### Tool: `search_research_data`

```typescript
// 1. Get userId from args (default: "default")
// 2. Call fetchWithPayment(
//      `${RESEARCH_API_URL}/api/research?topic=${encodeURIComponent(args.topic)}`,
//      { method: 'GET' },
//      { userId, walletManager }
//    )
// 3. Parse JSON response
// 4. Return as MCP content text
```

### Tool: `analyze_text`

```typescript
// 1. Call fetchWithPayment(
//      `${ANALYSIS_API_URL}/api/analyze`,
//      { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ text: args.text }) },
//      { userId, walletManager }
//    )
```

### Tool: `get_market_data`

```typescript
// 1. Call fetchWithPayment(
//      `${MARKET_API_URL}/api/market?token=${args.token}`,
//      { method: 'GET' },
//      { userId, walletManager }
//    )
```

### Tool: `translate_text`

```typescript
// 1. Call fetchWithPayment(
//      `${TRANSLATE_API_URL}/api/translate`,
//      { method: 'POST', ... body: { text, targetLang } },
//      { userId, walletManager }
//    )
```

---

## PART 5: Wallet Storage Design

This section is critical. Every user gets exactly one wallet. One wallet per userId forever.

### SQLite Schema

```sql
CREATE TABLE IF NOT EXISTS agent_wallets (
  userId            TEXT PRIMARY KEY,
  stxAddress        TEXT NOT NULL UNIQUE,
  encryptedPrivKey  TEXT NOT NULL,
  network           TEXT NOT NULL DEFAULT 'testnet',
  createdAt         TEXT NOT NULL,
  lastUsedAt        TEXT
);

CREATE TABLE IF NOT EXISTS payment_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  userId      TEXT NOT NULL,
  txId        TEXT NOT NULL UNIQUE,
  recipient   TEXT NOT NULL,
  microSTX    TEXT NOT NULL,
  service     TEXT,
  timestamp   TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES agent_wallets(userId)
);
```

### Encryption Scheme for Private Keys

Use Node.js built-in `crypto` module with AES-256-GCM:

```typescript
// Encrypt:
// 1. key = crypto.scryptSync(WALLET_ENCRYPTION_SECRET, 'x402-stacks-salt', 32)
// 2. iv = crypto.randomBytes(16)
// 3. cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
// 4. encrypted = cipher.update(privateKey, 'utf8', 'hex') + cipher.final('hex')
// 5. authTag = cipher.getAuthTag().toString('hex')
// 6. stored = `${iv.toString('hex')}:${authTag}:${encrypted}`

// Decrypt:
// 1. Split stored by ':' → [ivHex, authTagHex, encryptedHex]
// 2. key = crypto.scryptSync(WALLET_ENCRYPTION_SECRET, 'x402-stacks-salt', 32)
// 3. decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'))
// 4. decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))
// 5. decrypted = decipher.update(encryptedHex, 'hex', 'utf8') + decipher.final('utf8')
```

### userId Strategy

For MCP context, userId needs to be stable across sessions. Use these rules in order:

1. If the tool call includes an explicit `userId` argument, use that
2. If MCP session has a client ID, use that
3. Fall back to `"default"` for single-user deployments

For the hackathon demo, using `"default"` as userId is perfectly fine. The architecture supports multi-user but demo only needs one agent.

---

## PART 6: Claude Desktop Configuration

After building, add to Claude Desktop's config file.

**Location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

**Config to add:**

```json
{
  "mcpServers": {
    "x402-stacks-agent": {
      "command": "node",
      "args": ["/absolute/path/to/x402-mcp/mcp-server/dist/index.js"],
      "env": {
        "STACKS_NETWORK": "testnet",
        "FACILITATOR_URL": "https://x402-facilitator.stacksx402.com",
        "WALLET_DB_PATH": "/absolute/path/to/x402-mcp/wallets.db",
        "WALLET_ENCRYPTION_SECRET": "your-secret-here",
        "RESEARCH_API_URL": "http://localhost:3001",
        "ANALYSIS_API_URL": "http://localhost:3002",
        "MARKET_API_URL": "http://localhost:3003",
        "TRANSLATE_API_URL": "http://localhost:3004"
      }
    }
  }
}
```

---

## PART 7: Package.json

```json
{
  "name": "x402-mcp",
  "version": "1.0.0",
  "description": "MCP Server enabling AI agents to autonomously pay for services using STX via x402-stacks",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start:mcp": "node dist/mcp-server/index.js",
    "start:research": "node dist/demo-services/research-api/server.js",
    "start:analysis": "node dist/demo-services/analysis-api/server.js",
    "start:market": "node dist/demo-services/market-api/server.js",
    "start:translate": "node dist/demo-services/translate-api/server.js",
    "start:all-services": "concurrently \"npm run start:research\" \"npm run start:analysis\" \"npm run start:market\" \"npm run start:translate\"",
    "dev": "ts-node mcp-server/index.ts"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "@stacks/network": "^6.13.0",
    "@stacks/transactions": "^6.13.0",
    "@stacks/wallet-sdk": "^0.5.0",
    "@stacks/encryption": "^6.13.0",
    "better-sqlite3": "^9.4.0",
    "express": "^4.18.0",
    "x402-stacks": "latest",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.0",
    "@types/express": "^4.17.0",
    "@types/node": "^20.0.0",
    "concurrently": "^8.0.0",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.0"
  }
}
```

---

## PART 8: tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  },
  "include": ["mcp-server/**/*", "demo-services/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## PART 9: Getting Testnet STX

The agent wallet needs testnet STX to pay for services. To fund it:

1. Run the MCP server once and call `get_agent_wallet` tool with userId "default"
2. Copy the STX address it returns (format: `ST1...` for testnet)
3. Go to: `https://explorer.hiro.so/sandbox/faucet?chain=testnet`
4. Paste the address and request testnet STX
5. Wait 30-60 seconds for confirmation
6. Call `get_agent_wallet` again to confirm balance

Alternatively use the Stacks testnet faucet API directly:
```bash
curl -X POST https://api.testnet.hiro.so/extended/v1/faucets/stx?address=YOUR_ST_ADDRESS
```

---

## PART 10: Demo Script for Video

This is the exact sequence to record for the 5-minute submission video.

**Step 1 (0:00-0:30):** Show the problem. Open a terminal, curl a demo service directly:
```bash
curl http://localhost:3001/api/research?topic=bitcoin
# Shows 402 Payment Required response
```

**Step 2 (0:30-1:00):** Show Claude Desktop with x402 MCP tools available in the toolbar.

**Step 3 (1:00-1:30):** Ask Claude: "Check my agent wallet balance first."  
Claude calls `get_agent_wallet`, shows the STX address and balance.

**Step 4 (1:30-3:00):** Ask Claude: "Research the latest developments in Stacks blockchain, analyze the sentiment of what you find, and translate the summary to Indonesian."  
Watch Claude automatically call three tools in sequence. In the background terminal, show the payment logs appearing in real time.

**Step 5 (3:00-4:00):** Open Stacks testnet explorer (`explorer.hiro.so/?chain=testnet`), search the wallet address, show the three transactions that just happened on-chain.

**Step 6 (4:00-5:00):** Show the code — specifically `fetchWithPayment.ts` and how it integrates `x402-stacks`. Explain that the agent paid autonomously using the x402-stacks protocol without any human intervention.

---

## Key Technical Notes for Cursor

1. **x402-stacks header format:** Check `github.com/tony1908/x402-stacks` source code to confirm the exact header name for payment signature. It is likely `payment-signature` based on their docs showing `scheme: "exact"`.

2. **Network identifier:** Stacks testnet in CAIP-2 format is `stacks:2147483648`. Stacks mainnet is `stacks:1`. The `x402-stacks` middleware expects this format in the `network` field.

3. **microSTX conversion:** 1 STX = 1,000,000 microSTX. The `amount` field in x402-stacks config is always in microSTX as a string.

4. **MCP stdout rule:** NEVER use `console.log` inside the MCP server. The MCP protocol uses stdout for JSON-RPC messages. Use `console.error` for all debug logging — it goes to stderr and does not interfere.

5. **Transaction confirmation speed:** Stacks testnet confirms in 10-30 seconds typically. For the demo, after calling `broadcastTransaction`, wait 2-3 seconds before retrying the API request. The x402-stacks facilitator may accept the txId immediately after broadcast without waiting for full confirmation — test this behavior first.

6. **Wallet SDK note:** `@stacks/wallet-sdk` may need `generateSecretKey()` for mnemonic generation and `generateWallet()` to derive the account. The `@stacks/transactions` package is used for actually building and broadcasting the STX transfer. These are separate packages with different responsibilities.

7. **Error messages to handle:** If wallet has insufficient STX, throw a clear error: `"Insufficient STX balance. Agent wallet ${address} has ${balance} microSTX but needs ${required} microSTX. Fund the wallet at: https://explorer.hiro.so/sandbox/faucet?chain=testnet"`

8. **Demo services wallet addresses:** Each demo service receives payments to its own wallet. Generate four testnet addresses (you can use Hiro wallet or the Stacks Explorer sandbox). Put them in environment variables for each service. They do not need private keys — only the recipient address matters for the `payTo` field.

---

## Why This Wins the Hackathon

The judging criteria per the rules: innovation, practical use case, and integration with x402-stacks.

This project scores on all three:

**Innovation:** First MCP server that enables AI agents to autonomously pay for services using Stacks blockchain. No one else in this hackathon is building at this intersection.

**Practical use case:** Any developer can plug this MCP server into Claude Desktop and immediately give Claude access to paid data services without setting up payment infrastructure. The agent wallet abstraction makes micropayments completely invisible to the end user.

**Integration with x402-stacks:** Every single paid API call goes through `paymentMiddleware` from the `x402-stacks` package. The project cannot function without it. Every demo generates real verifiable transactions on the Stacks blockchain.

---

## Submission Checklist

- [ ] GitHub repository is public
- [ ] All four demo services run and return 402 when called without payment
- [ ] MCP server connects to Claude Desktop successfully
- [ ] `get_agent_wallet` tool returns a real testnet STX address
- [ ] At least one paid tool call generates a real transaction visible on Stacks testnet explorer
- [ ] `.env.example` is committed (not `.env`)
- [ ] `wallets.db` is in `.gitignore`
- [ ] Video demo is 5 minutes or less and shows the full payment flow
- [ ] README explains the x402-stacks integration clearly