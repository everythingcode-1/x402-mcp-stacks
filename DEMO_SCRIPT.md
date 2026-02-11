# Demo Script for x402-stacks MCP Server

## 5-Minute Video Demo Script

### Setup (Before Recording)
1. Start all demo services: `npm run start:all-services`
2. Fund agent wallet with testnet STX (at least 0.1 STX)
3. Restart Claude Desktop with MCP server configured
4. Open Stacks testnet explorer in browser
5. Prepare terminal windows

---

### Scene 1: The Problem (0:00-0:45)

**Show terminal**

```bash
# Try to access a paid API without payment
curl http://localhost:3001/api/research?topic=bitcoin
```

**Expected output:**
```json
{
  "error": "payment_required",
  "paymentRequirements": {
    "payTo": "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    "amount": "2000",
    "tokenType": "STX",
    ...
  }
}
```

**Narration:**
"Traditional APIs require payment infrastructure. With x402-stacks, we can enable AI agents to autonomously pay for services using Bitcoin-secured STX."

---

### Scene 2: Show Claude Desktop Setup (0:45-1:15)

**Show Claude Desktop interface**

Point out the MCP tools in the toolbar:
- get_agent_wallet
- search_research_data
- analyze_text
- get_market_data
- translate_text

**Narration:**
"I've integrated x402-stacks with Claude Desktop using the Model Context Protocol. These tools allow Claude to autonomously discover and pay for API services."

---

### Scene 3: Check Wallet (1:15-1:45)

**In Claude Desktop, type:**
```
Check my agent wallet balance
```

**Claude will call the tool and show:**
```json
{
  "userId": "default",
  "address": "ST1ABC...",
  "balanceSTX": "0.500000",
  "network": "testnet",
  "faucetUrl": "https://explorer.hiro.so/sandbox/faucet?chain=testnet&address=ST1ABC..."
}
```

**Narration:**
"First, let's check the agent's wallet. It has a Stacks address and testnet STX balance. This wallet will autonomously pay for services."

---

### Scene 4: AI Agent Makes Autonomous Payments (1:45-3:30)

**In Claude Desktop, type:**
```
Research the latest developments in Stacks blockchain, analyze the sentiment of what you find, and translate the summary to Indonesian.
```

**Show split screen:**
- Left: Claude Desktop executing tools
- Right: Terminal showing payment logs in real-time

**Expected logs:**
```
[x402] Received 402 Payment Required from http://localhost:3001/api/research?topic=Stacks%20blockchain
[x402] Paying 2000 microSTX to ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM...
[WalletManager] Sent 2000 microSTX to ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM | tx: 0xabc123...
[x402] Payment verified! Request successful.

[x402] Received 402 Payment Required from http://localhost:3002/api/analyze
[x402] Paying 5000 microSTX to ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG...
[WalletManager] Sent 5000 microSTX to ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG | tx: 0xdef456...
[x402] Payment verified! Request successful.

[x402] Received 402 Payment Required from http://localhost:3004/api/translate
[x402] Paying 1000 microSTX to ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND...
[WalletManager] Sent 1000 microSTX to ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND | tx: 0xghi789...
[x402] Payment verified! Request successful.
```

**Narration:**
"Watch as Claude autonomously calls three paid services. Each time it hits a 402 response, the MCP server automatically pays from the agent wallet using x402-stacks, and retries the request. Claude never sees the payment—it just gets the data."

---

### Scene 5: Verify On-Chain (3:30-4:15)

**Show Stacks testnet explorer:**
1. Search for the agent wallet address
2. Show the three transactions that just occurred
3. Click on one transaction to show details:
   - From: Agent wallet
   - To: Service wallet
   - Amount: 2000 microSTX (0.002 STX)
   - Status: Success

**Narration:**
"Every payment is a real transaction on the Stacks blockchain. Here we can see all three payments verified on-chain, secured by Bitcoin."

---

### Scene 6: Show the Code (4:15-5:00)

**Show `fetchWithPayment.ts` in editor**

Highlight key sections:
1. Detect 402 response
2. Extract payment requirements
3. Call `walletManager.sendSTX()`
4. Retry with payment signature header
5. Return successful response

**Show x402-stacks integration:**
```typescript
const gate = paymentMiddleware({
  payTo: process.env.RESEARCH_SERVICE_WALLET,
  amount: "2000",
  tokenType: "STX",
  network: "stacks:2147483648",
  facilitatorUrl: "https://x402-facilitator.stacksx402.com",
  scheme: "exact",
});
```

**Narration:**
"The magic happens in fetchWithPayment.ts, which wraps every API call with automatic x402 payment handling. The demo services use x402-stacks paymentMiddleware to protect endpoints. This is the first time an AI agent can autonomously pay for services using Bitcoin-secured STX."

---

### Closing (5:00)

**Show final screen with:**
- Project name: x402-stacks MCP Server
- GitHub repository URL
- Key features:
  - ✅ Autonomous AI payments with STX
  - ✅ x402-stacks protocol integration
  - ✅ Model Context Protocol (MCP)
  - ✅ Bitcoin-secured transactions
  - ✅ Zero human intervention

**Narration:**
"This project demonstrates the future of AI agents—autonomous, self-sufficient, and able to pay for what they need using Bitcoin-secured Stacks. Thank you!"

---

## Recording Tips

1. **Audio**: Use clear narration, speak slowly and clearly
2. **Screen**: 1920x1080 resolution, clean desktop
3. **Timing**: Practice to stay under 5 minutes
4. **Lighting**: Good lighting for any on-camera segments
5. **Editing**: Add transitions between scenes, highlight key moments
6. **Music**: Optional background music (low volume)

## What to Emphasize

1. **Innovation**: First MCP server enabling autonomous AI payments with STX
2. **x402-stacks Integration**: Every payment uses the x402-stacks protocol
3. **Practical Use Case**: Real-world application of AI agents paying for services
4. **Bitcoin Security**: Transactions secured by Bitcoin through Stacks
5. **Autonomous Operation**: No human intervention required

## Common Issues During Demo

- **Service not responding**: Restart demo services
- **Insufficient balance**: Fund wallet before demo
- **Payment verification slow**: Wait 3-5 seconds between calls
- **Claude not showing tools**: Restart Claude Desktop

## Backup Plan

If live demo fails, have pre-recorded footage of:
1. Successful tool calls
2. Payment logs
3. Explorer showing transactions
