# Deployment Guide - x402-stacks MCP Server

## 🌐 Live Deployments

- **Landing Page**: https://x402-mcp-stacks.vercel.app/
- **MCP HTTP Server**: (To be deployed to Railway)
- **Tool Registry API**: (To be deployed)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Claude.ai                           │
│                  (Remote Connector)                     │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/SSE
                     ↓
┌─────────────────────────────────────────────────────────┐
│              MCP HTTP Server (Railway)                  │
│         https://your-app.railway.app                    │
└────────────────────┬────────────────────────────────────┘
                     │ x402 Payment Flow
                     ↓
┌─────────────────────────────────────────────────────────┐
│                  Demo API Services                      │
│  Research │ Analysis │ Market │ Translate               │
└─────────────────────────────────────────────────────────┘
```

---

## Option 1: Deploy MCP Server to Railway (Recommended)

Railway supports long-running Node.js processes and SSE, perfect for MCP Remote Connectors.

### Step 1: Prepare for Deployment

```bash
# Build the project
npm run build

# Test HTTP server locally
npm run dev:http
```

### Step 2: Deploy to Railway

1. **Create Railway Account**: https://railway.app/
2. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

3. **Login to Railway**:
   ```bash
   railway login
   ```

4. **Initialize Project**:
   ```bash
   railway init
   ```

5. **Set Environment Variables**:
   ```bash
   railway variables set STACKS_NETWORK=testnet
   railway variables set ENCRYPTION_SECRET=your-long-random-secret-here
   railway variables set RESEARCH_API_URL=http://localhost:3001
   railway variables set ANALYSIS_API_URL=http://localhost:3002
   railway variables set MARKET_API_URL=http://localhost:3003
   railway variables set TRANSLATE_API_URL=http://localhost:3004
   ```

6. **Deploy**:
   ```bash
   railway up
   ```

7. **Get Your URL**:
   ```bash
   railway domain
   ```
   Your MCP server will be available at: `https://your-app.railway.app`

### Step 3: Connect to Claude.ai

1. Go to https://claude.ai/connectors
2. Click "Add Custom Connector"
3. Enter your Railway URL: `https://your-app.railway.app/sse`
4. Test the connection
5. Start using MCP tools in Claude!

---

## Option 2: Deploy to Render

1. **Create Render Account**: https://render.com/
2. **Create New Web Service**
3. **Connect GitHub Repository**: `everythingcode-1/x402-mcp-stacks`
4. **Configure**:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:http`
   - **Environment Variables**:
     ```
     STACKS_NETWORK=testnet
     ENCRYPTION_SECRET=your-secret
     WALLET_DB_PATH=/opt/render/project/src/wallets.db
     ```
5. **Deploy**

---

## Option 3: Deploy to Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Set secrets
fly secrets set STACKS_NETWORK=testnet
fly secrets set ENCRYPTION_SECRET=your-secret

# Deploy
fly deploy
```

---

## Environment Variables Required

| Variable | Description | Example |
|----------|-------------|---------|
| `STACKS_NETWORK` | Stacks network | `testnet` or `mainnet` |
| `ENCRYPTION_SECRET` | Wallet encryption key | Long random string |
| `WALLET_DB_PATH` | SQLite database path | `/tmp/wallets.db` |
| `RESEARCH_API_URL` | Research API endpoint | `http://localhost:3001` |
| `ANALYSIS_API_URL` | Analysis API endpoint | `http://localhost:3002` |
| `MARKET_API_URL` | Market API endpoint | `http://localhost:3003` |
| `TRANSLATE_API_URL` | Translate API endpoint | `http://localhost:3004` |
| `PORT` | Server port (auto-set) | `3000` |

---

## Testing Deployment

### 1. Health Check
```bash
curl https://your-app.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "x402-stacks-mcp-server"
}
```

### 2. Info Endpoint
```bash
curl https://your-app.railway.app/
```

### 3. SSE Connection
```bash
curl -N https://your-app.railway.app/sse
```

---

## Connecting to Claude.ai

### For Remote Connectors:

1. **Navigate to Connectors**:
   - Go to https://claude.ai/connectors
   - Or click your profile → "Connectors"

2. **Add Custom Connector**:
   - Click "Add Custom Connector"
   - **Name**: `x402-stacks MCP`
   - **Description**: `AI agent with autonomous STX payments`
   - **SSE Endpoint**: `https://your-app.railway.app/sse`
   - **Message Endpoint**: `https://your-app.railway.app/message`

3. **Test Connection**:
   - Click "Test Connection"
   - Should show: ✅ Connected

4. **Use Tools**:
   In Claude chat, you can now use:
   - `search_research_data` - Search research database
   - `analyze_text` - Analyze text sentiment
   - `get_market_data` - Get market data
   - `translate_text` - Translate text
   - `get_wallet_info` - Check agent wallet

---

## Troubleshooting

### Issue: SSE Connection Fails
**Solution**: Ensure your deployment platform supports SSE (Railway, Render, Fly.io do; Vercel doesn't)

### Issue: Wallet Database Not Persisting
**Solution**: Use persistent volume:
- Railway: Add volume in dashboard
- Render: Use persistent disk
- Fly.io: Add volume in `fly.toml`

### Issue: Payment Fails
**Solution**: 
1. Check wallet has testnet STX
2. Get testnet STX from faucet
3. Verify `STACKS_NETWORK=testnet`

---

## Cost Estimation

### Railway (Recommended)
- **Hobby Plan**: $5/month
- **Includes**: 500 hours, 8GB RAM, persistent storage
- **Perfect for**: Development and testing

### Render
- **Free Tier**: Available (with limitations)
- **Starter**: $7/month
- **Includes**: Persistent disk, custom domain

### Fly.io
- **Free Tier**: 3 shared-cpu-1x VMs
- **Paid**: ~$5/month for small apps

---

## Next Steps

1. ✅ Deploy MCP HTTP server to Railway
2. ✅ Deploy demo APIs (optional)
3. ✅ Connect to Claude.ai
4. ✅ Fund agent wallet with testnet STX
5. ✅ Test autonomous payments!

---

## Support

- **GitHub**: https://github.com/everythingcode-1/x402-mcp-stacks
- **Landing Page**: https://x402-mcp-stacks.vercel.app/
- **Documentation**: See README.md

