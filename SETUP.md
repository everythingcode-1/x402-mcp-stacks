# x402-stacks MCP Server - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `env.example` to `.env` and update the values:
```bash
cp env.example .env
```

Edit `.env` and set:
- `WALLET_ENCRYPTION_SECRET`: A random string of at least 32 characters
- Service wallet addresses (or use the defaults for testing)

### 3. Build the Project
```bash
npm run build
```

### 4. Start Demo Services
In separate terminals, run:
```bash
npm run start:research   # Port 3001
npm run start:analysis   # Port 3002
npm run start:market     # Port 3003
npm run start:translate  # Port 3004
```

Or start all at once:
```bash
npm run start:all-services
```

### 5. Configure Claude Desktop

Edit your Claude Desktop config file:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

Add this configuration (update paths to absolute paths on your system):

```json
{
  "mcpServers": {
    "x402-stacks-agent": {
      "command": "node",
      "args": ["C:/Users/HP/OneDrive/Dokumen/Program/hacktone/x402-mcp-stacks/dist/mcp-server/index.js"],
      "env": {
        "STACKS_NETWORK": "testnet",
        "FACILITATOR_URL": "https://x402-facilitator.stacksx402.com",
        "WALLET_DB_PATH": "C:/Users/HP/OneDrive/Dokumen/Program/hacktone/x402-mcp-stacks/wallets.db",
        "WALLET_ENCRYPTION_SECRET": "your-very-long-random-secret-string-here-minimum-32-chars",
        "RESEARCH_API_URL": "http://localhost:3001",
        "ANALYSIS_API_URL": "http://localhost:3002",
        "MARKET_API_URL": "http://localhost:3003",
        "TRANSLATE_API_URL": "http://localhost:3004"
      }
    }
  }
}
```

### 6. Restart Claude Desktop

After saving the config, restart Claude Desktop to load the MCP server.

### 7. Get Testnet STX

1. In Claude Desktop, ask: "Check my agent wallet balance"
2. Copy the STX address from the response
3. Visit: https://explorer.hiro.so/sandbox/faucet?chain=testnet
4. Paste your address and request testnet STX
5. Wait 30-60 seconds for confirmation
6. Check balance again in Claude

### 8. Test the Tools

Try these commands in Claude Desktop:

```
Check my agent wallet balance
```

```
Search for research data about "Stacks blockchain"
```

```
Analyze this text: "Bitcoin and Stacks are bringing smart contracts to Bitcoin with amazing growth potential"
```

```
Get market data for STX
```

```
Translate "Bitcoin is the future of money" to Indonesian
```

## Available Tools

1. **get_agent_wallet** - Get wallet address and balance
2. **search_research_data** - Search research data (0.002 STX/call)
3. **analyze_text** - Sentiment analysis (0.005 STX/call)
4. **get_market_data** - Market data for tokens (0.001 STX/call)
5. **translate_text** - Translation service (0.001 STX/call)

## How It Works

1. Claude calls an MCP tool
2. MCP server hits a paid API protected by x402-stacks
3. API returns HTTP 402 Payment Required
4. MCP server automatically pays from agent wallet
5. API verifies payment via x402-stacks facilitator
6. API returns data
7. MCP returns data to Claude

All payments are automatic and transparent to Claude!

## Troubleshooting

### MCP Server Not Showing in Claude
- Check that paths in config are absolute, not relative
- Restart Claude Desktop after config changes
- Check Claude Desktop logs for errors

### Insufficient Balance Error
- Fund your wallet using the testnet faucet
- Each tool call costs between 0.001-0.005 STX
- Minimum recommended balance: 0.1 STX

### Payment Verification Failed
- Wait a few seconds and try again
- Check transaction on explorer: https://explorer.hiro.so/?chain=testnet
- Ensure demo services are running

### Demo Services Not Responding
- Ensure all services are running on correct ports
- Check for port conflicts
- Restart services if needed

## Project Structure

```
x402-mcp-stacks/
├── mcp-server/
│   ├── index.ts              # MCP Server entry point
│   ├── config.ts             # Configuration
│   └── core/
│       ├── walletManager.ts  # Wallet management & STX payments
│       └── fetchWithPayment.ts # x402 payment cycle handler
├── demo-services/
│   ├── research-api/         # Research data API (0.002 STX)
│   ├── analysis-api/         # Text analysis API (0.005 STX)
│   ├── market-api/           # Market data API (0.001 STX)
│   └── translate-api/        # Translation API (0.001 STX)
├── dist/                     # Compiled JavaScript
├── wallets.db               # SQLite database (auto-created)
└── .env                     # Environment config (create from env.example)
```

## Security Notes

- Private keys are encrypted with AES-256-GCM before storage
- Never commit `.env` or `wallets.db` to version control
- Use a strong `WALLET_ENCRYPTION_SECRET` (32+ characters)
- For production, use mainnet and secure key management

## Demo Video Script

1. Show 402 response from API (curl)
2. Show Claude Desktop with MCP tools
3. Check wallet balance
4. Ask Claude to research, analyze, and translate
5. Show transactions on Stacks explorer
6. Explain x402-stacks integration

## Support

For issues or questions:
- Check the main README.md
- Review x402-stacks documentation: https://github.com/tony1908/x402-stacks
- Check Stacks documentation: https://docs.stacks.co
