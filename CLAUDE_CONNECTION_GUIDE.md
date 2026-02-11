# Claude Connection Guide - x402-stacks MCP

## ⚠️ Important: MCP Connection Methods

Ada **2 cara berbeda** untuk menghubungkan MCP server dengan Claude:

### 1. Claude Desktop (Recommended) ✅
- **Cara Kerja**: stdio-based, running local
- **Kelebihan**: Fully supported, stable, official
- **Kekurangan**: Harus install Claude Desktop app
- **Status**: ✅ **WORKING**

### 2. Claude.ai Remote Connectors (Experimental) ⚠️
- **Cara Kerja**: HTTP/SSE, deployed server
- **Kelebihan**: Tidak perlu install app
- **Kekurangan**: Limited support, masih beta
- **Status**: ⚠️ **EXPERIMENTAL** (sering error)

---

## ✅ Metode 1: Claude Desktop (RECOMMENDED)

Ini adalah cara **official dan paling reliable** untuk menggunakan MCP server.

### Step 1: Install Claude Desktop

Download dari: https://claude.ai/download

### Step 2: Configure MCP Server

Edit file konfigurasi Claude Desktop:

**Windows**:
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS**:
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux**:
```
~/.config/Claude/claude_desktop_config.json
```

### Step 3: Add MCP Server Config

```json
{
  "mcpServers": {
    "x402-stacks": {
      "command": "node",
      "args": [
        "C:\\Users\\HP\\OneDrive\\Dokumen\\Program\\hacktone\\x402-mcp-stacks\\dist\\mcp-server\\index.js"
      ],
      "env": {
        "STACKS_NETWORK": "testnet",
        "WALLET_DB_PATH": "C:\\Users\\HP\\OneDrive\\Dokumen\\Program\\hacktone\\x402-mcp-stacks\\wallets.db",
        "WALLET_ENCRYPTION_SECRET": "your-secret-here-min-32-chars"
      }
    }
  }
}
```

### Step 4: Build MCP Server

```bash
cd C:\Users\HP\OneDrive\Dokumen\Program\hacktone\x402-mcp-stacks
npm run build
```

### Step 5: Restart Claude Desktop

Restart aplikasi Claude Desktop. MCP server akan otomatis start.

### Step 6: Verify Connection

Di Claude Desktop, cek apakah tools tersedia:
- 🔍 `search_research_data`
- 📊 `analyze_text`
- 💹 `get_market_data`
- 🌐 `translate_text`
- 💰 `get_agent_wallet`

### Step 7: Test Tools

Coba tanyakan ke Claude:
```
Can you get my agent wallet info?
```

Claude akan otomatis call tool `get_agent_wallet` dan return wallet address + balance.

---

## ⚠️ Metode 2: Claude.ai Remote Connectors (EXPERIMENTAL)

**WARNING**: Metode ini masih experimental dan sering mengalami error koneksi.

### Why It's Not Working

1. **MCP SDK SSE Transport** masih dalam development
2. **Claude.ai Remote Connectors** belum fully support MCP protocol
3. **Authentication** dan **CORS** issues

### Current Status

- ✅ Server deployed: https://x402-mcp-stacks-production.up.railway.app
- ✅ Health check working: `/health`
- ❌ SSE connection failing: `/sse`
- ❌ Claude.ai can't connect

### Known Issues

```
Error: There was an error connecting to the MCP server.
Please check your server URL and make sure your server handles auth correctly.
```

**Root Cause**: 
- Claude.ai expects specific SSE format
- MCP SDK SSE transport not fully compatible
- Missing authentication headers

### Possible Solutions (Advanced)

Jika Anda ingin tetap mencoba Remote Connectors:

1. **Implement Custom SSE Handler**
   - Tidak menggunakan MCP SDK SSE transport
   - Manual implementation sesuai Claude.ai spec

2. **Add Authentication**
   - Bearer token
   - API key validation

3. **Fix CORS Headers**
   - Allow Claude.ai domain
   - Proper preflight handling

**Namun**, ini memerlukan reverse engineering Claude.ai Remote Connector protocol yang tidak terdokumentasi.

---

## 🎯 Recommendation

**Gunakan Claude Desktop (Metode 1)** karena:

✅ **Fully supported** oleh Anthropic
✅ **Stable** dan reliable
✅ **Official** MCP implementation
✅ **Better performance** (no network latency)
✅ **More secure** (local-only)

Remote Connectors masih **experimental** dan **not recommended** untuk production use.

---

## 📝 Quick Setup Commands

### For Claude Desktop (Local)

```bash
# 1. Build project
cd C:\Users\HP\OneDrive\Dokumen\Program\hacktone\x402-mcp-stacks
npm run build

# 2. Test MCP server locally
npm run dev:mcp

# 3. Configure Claude Desktop (edit config file)
# 4. Restart Claude Desktop
# 5. Done!
```

### For Remote Connector (Not Working Yet)

```bash
# Server already deployed at:
# https://x402-mcp-stacks-production.up.railway.app

# But connection fails due to SSE protocol mismatch
# Use Claude Desktop instead
```

---

## 🔧 Troubleshooting

### Claude Desktop: "MCP server not found"

**Solution**: Check config file path dan pastikan `command` dan `args` benar.

### Claude Desktop: "MCP server crashed"

**Solution**: 
```bash
# Check if build successful
npm run build

# Test manually
node dist/mcp-server/index.js
```

### Remote Connector: "Connection error"

**Solution**: **Use Claude Desktop instead**. Remote Connectors belum stable.

---

## 📚 Resources

- **MCP Documentation**: https://modelcontextprotocol.io/
- **Claude Desktop**: https://claude.ai/download
- **GitHub Repo**: https://github.com/everythingcode-1/x402-mcp-stacks

---

## ✅ Summary

| Method | Status | Recommended |
|--------|--------|-------------|
| **Claude Desktop** | ✅ Working | ✅ **YES** |
| **Remote Connector** | ❌ Not Working | ❌ NO |

**Use Claude Desktop for reliable MCP server connection.**
