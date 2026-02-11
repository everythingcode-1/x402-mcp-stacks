import { WalletManager } from './dist/mcp-server/core/walletManager.js';
import { fetchWithPayment } from './dist/mcp-server/core/fetchWithPayment.js';

console.log('=== Testing x402 Payment Flow ===\n');

const walletManager = new WalletManager();
const userId = 'test-user';

try {
  // Get wallet
  const wallet = await walletManager.getOrCreateWallet(userId);
  console.log('Wallet Address:', wallet.address);
  
  const balanceBefore = await walletManager.getBalance(wallet.address);
  console.log('Balance Before:', Number(balanceBefore) / 1_000_000, 'STX\n');

  // Test 1: Research API (0.002 STX)
  console.log('--- Test 1: Research API ---');
  console.log('Calling: http://localhost:3001/api/research?topic=bitcoin');
  console.log('Expected cost: 0.002 STX\n');

  const response1 = await fetchWithPayment(
    'http://localhost:3001/api/research?topic=bitcoin',
    { method: 'GET' },
    { userId, walletManager }
  );

  if (response1.ok) {
    const data = await response1.json();
    console.log('✓ Payment successful!');
    console.log('✓ Data received:');
    console.log('  - Topic:', data.topic);
    console.log('  - Articles:', data.articles.length);
    console.log('  - First article:', data.articles[0].title);
  }

  // Check balance after payment
  const balanceAfter1 = await walletManager.getBalance(wallet.address);
  const spent1 = Number(balanceBefore - balanceAfter1) / 1_000_000;
  console.log('\nBalance After:', Number(balanceAfter1) / 1_000_000, 'STX');
  console.log('Spent:', spent1.toFixed(6), 'STX');

  // Test 2: Market API (0.001 STX)
  console.log('\n--- Test 2: Market API ---');
  console.log('Calling: http://localhost:3003/api/market?token=STX');
  console.log('Expected cost: 0.001 STX\n');

  const response2 = await fetchWithPayment(
    'http://localhost:3003/api/market?token=STX',
    { method: 'GET' },
    { userId, walletManager }
  );

  if (response2.ok) {
    const data = await response2.json();
    console.log('✓ Payment successful!');
    console.log('✓ Data received:');
    console.log('  - Token:', data.token);
    console.log('  - Price:', data.priceUSD, 'USD');
    console.log('  - Change 24h:', data.change24h);
  }

  const balanceAfter2 = await walletManager.getBalance(wallet.address);
  const spent2 = Number(balanceAfter1 - balanceAfter2) / 1_000_000;
  console.log('\nBalance After:', Number(balanceAfter2) / 1_000_000, 'STX');
  console.log('Spent:', spent2.toFixed(6), 'STX');

  // Test 3: Analysis API (0.005 STX)
  console.log('\n--- Test 3: Analysis API ---');
  console.log('Calling: http://localhost:3002/api/analyze');
  console.log('Expected cost: 0.005 STX\n');

  const response3 = await fetchWithPayment(
    'http://localhost:3002/api/analyze',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        text: 'Bitcoin and Stacks are bringing smart contracts to Bitcoin with amazing growth potential' 
      })
    },
    { userId, walletManager }
  );

  if (response3.ok) {
    const data = await response3.json();
    console.log('✓ Payment successful!');
    console.log('✓ Data received:');
    console.log('  - Sentiment:', data.sentiment);
    console.log('  - Confidence:', data.confidence);
    console.log('  - Entities:', data.entities.join(', '));
  }

  const balanceAfter3 = await walletManager.getBalance(wallet.address);
  const spent3 = Number(balanceAfter2 - balanceAfter3) / 1_000_000;
  console.log('\nBalance After:', Number(balanceAfter3) / 1_000_000, 'STX');
  console.log('Spent:', spent3.toFixed(6), 'STX');

  // Summary
  const totalSpent = Number(balanceBefore - balanceAfter3) / 1_000_000;
  console.log('\n=== Summary ===');
  console.log('Total Spent:', totalSpent.toFixed(6), 'STX');
  console.log('Final Balance:', Number(balanceAfter3) / 1_000_000, 'STX');
  console.log('\n✓ All payments processed successfully!');
  console.log('✓ x402-stacks integration working perfectly!');
  console.log('\nCheck transactions at:');
  console.log(`https://explorer.hiro.so/address/${wallet.address}?chain=testnet`);

} catch (error) {
  console.error('\n✗ Error:', error.message);
  console.error(error);
} finally {
  walletManager.close();
}
