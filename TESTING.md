# Panduan Testing x402-stacks MCP Server

## Karena Claude Desktop Tidak Bisa Diinstall

Anda tetap bisa menguji dan mendemonstrasikan project ini tanpa Claude Desktop!

## Langkah-Langkah Testing

### 1. Setup Environment

Pastikan file `.env` sudah dibuat dan dikonfigurasi:

```bash
# Copy dari env.example jika belum
cp env.example .env
```

Edit `.env` dan pastikan `WALLET_ENCRYPTION_SECRET` sudah diisi (minimal 32 karakter).

### 2. Build Project

```bash
npm run build
```

### 3. Jalankan Demo Services

Buka terminal baru dan jalankan semua services:

```bash
npm run start:all-services
```

Atau jalankan satu per satu di terminal terpisah:

```bash
# Terminal 1
npm run start:research

# Terminal 2
npm run start:analysis

# Terminal 3
npm run start:market

# Terminal 4
npm run start:translate
```

Anda akan melihat output seperti:
```
Research API running on http://localhost:3001
Protected endpoint: GET /api/research?topic={topic}
Price: 2000 microSTX (0.002 STX) per call
```

### 4. Test Manual dengan cURL

Test bahwa API mengembalikan 402 Payment Required:

```bash
# Test Research API
curl http://localhost:3001/api/research?topic=bitcoin

# Test Analysis API
curl -X POST http://localhost:3002/api/analyze -H "Content-Type: application/json" -d "{\"text\":\"test\"}"

# Test Market API
curl http://localhost:3003/api/market?token=STX

# Test Translate API
curl -X POST http://localhost:3004/api/translate -H "Content-Type: application/json" -d "{\"text\":\"hello\",\"targetLang\":\"id\"}"
```

Semua harus mengembalikan response 402 dengan `paymentRequirements`.

### 5. Jalankan Test Script Otomatis

```bash
npm test
```

Test script akan:
1. ✓ Membuat wallet otomatis
2. ✓ Menampilkan address dan balance
3. ✓ Test semua demo services (harus return 402)
4. ✓ Jika ada balance, test payment flow lengkap

### 6. Fund Wallet (Jika Balance 0)

Dari output test script, copy STX address yang ditampilkan, lalu:

1. Buka: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Paste address Anda
3. Klik "Request STX"
4. Tunggu 30-60 detik
5. Jalankan `npm test` lagi untuk verify balance

### 7. Test Payment Flow Lengkap

Setelah wallet ada balance, jalankan lagi:

```bash
npm test
```

Script akan otomatis:
- Memanggil Research API
- Mendapat 402 response
- Membayar dengan STX
- Retry request dengan payment signature
- Menampilkan data yang diterima
- Menampilkan balance baru

## Alternatif: Test dengan Node.js Script

Buat file `manual-test.js`:

```javascript
import { WalletManager } from './dist/mcp-server/core/walletManager.js';
import { fetchWithPayment } from './dist/mcp-server/core/fetchWithPayment.js';

const walletManager = new WalletManager();

// Get wallet
const wallet = await walletManager.getOrCreateWallet('demo-user');
console.log('Wallet:', wallet.address);

// Check balance
const balance = await walletManager.getBalance(wallet.address);
console.log('Balance:', Number(balance) / 1_000_000, 'STX');

// Test payment (jika ada balance)
if (balance > 0n) {
  const response = await fetchWithPayment(
    'http://localhost:3001/api/research?topic=bitcoin',
    { method: 'GET' },
    { userId: 'demo-user', walletManager }
  );
  
  const data = await response.json();
  console.log('Data:', data);
}

walletManager.close();
```

Jalankan:
```bash
node manual-test.js
```

## Untuk Demo Video

Tanpa Claude Desktop, Anda tetap bisa membuat demo video yang bagus:

### Setup Layar:

**Split screen dengan 3 bagian:**
1. **Kiri atas**: Terminal dengan demo services running
2. **Kiri bawah**: Terminal untuk test script
3. **Kanan**: Browser dengan Stacks Explorer

### Skenario Demo:

1. **Tunjukkan 402 Response** (30 detik)
   ```bash
   curl http://localhost:3001/api/research?topic=bitcoin
   ```
   Highlight response 402 dengan payment requirements

2. **Tunjukkan Wallet** (30 detik)
   ```bash
   npm test
   ```
   Tunjukkan wallet address dan balance

3. **Tunjukkan Payment Flow** (2 menit)
   - Jalankan test script
   - Tunjukkan log payment di terminal services
   - Highlight: "Paid 2000 microSTX", "Payment verified"
   - Tunjukkan data yang diterima

4. **Verify On-Chain** (1 menit)
   - Buka Stacks Explorer
   - Search wallet address
   - Tunjukkan transaksi yang baru terjadi
   - Klik transaksi untuk detail

5. **Tunjukkan Code** (1 menit)
   - Buka `fetchWithPayment.ts`
   - Highlight payment logic
   - Buka demo service
   - Highlight x402-stacks middleware

### Narasi:

"Meskipun tanpa Claude Desktop, project ini mendemonstrasikan autonomous payment dengan x402-stacks. Setiap kali API mengembalikan 402, sistem otomatis membayar dengan STX, dan transaksi terverifikasi di blockchain Stacks."

## Alternatif MCP Client

Jika ingin test dengan MCP client lain:

### 1. MCP Inspector (Official)
```bash
npx @modelcontextprotocol/inspector node dist/mcp-server/index.js
```

### 2. Custom MCP Client
Buat simple client yang connect ke MCP server via stdio.

### 3. Web Interface
Buat simple web UI yang memanggil tools via HTTP wrapper.

## Troubleshooting

### Services tidak jalan
```bash
# Check port conflicts
netstat -ano | findstr "3001"
netstat -ano | findstr "3002"
netstat -ano | findstr "3003"
netstat -ano | findstr "3004"
```

### Wallet error
```bash
# Delete dan recreate
rm wallets.db
npm test
```

### Payment gagal
- Pastikan services running
- Pastikan wallet ada balance
- Check network (testnet)
- Tunggu beberapa detik antara payments

## Output yang Diharapkan

### Test Script Success:
```
=== x402-stacks MCP Server Test ===

1. Testing Wallet Creation...
   ✓ Wallet created: ST1ABC...

2. Checking Balance...
   ✓ Balance: 0.500000 STX (500000 microSTX)

3. Testing Demo Services...
   ✓ Research API returns 402 Payment Required
   ✓ Analysis API returns 402 Payment Required
   ✓ Market API returns 402 Payment Required
   ✓ Translate API returns 402 Payment Required

4. Testing Payment Flow with Research API...
   This will make a real payment on testnet!
   ✓ Payment successful! Data received:
   Topic: bitcoin
   Articles found: 3
   New balance: 0.498000 STX

=== Test Complete ===
```

## Kesimpulan

Project ini **BERFUNGSI PENUH** tanpa Claude Desktop! Anda bisa:
- ✅ Test semua komponen
- ✅ Verify payment flow
- ✅ Lihat transaksi on-chain
- ✅ Buat demo video
- ✅ Submit ke hackathon

Yang penting adalah **x402-stacks integration** dan **autonomous payment** - dan semua itu bisa didemonstrasikan tanpa Claude Desktop!
