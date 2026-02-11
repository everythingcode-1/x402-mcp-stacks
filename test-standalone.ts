import { WalletManager } from './mcp-server/core/walletManager.js';
import { fetchWithPayment } from './mcp-server/core/fetchWithPayment.js';
import { config } from './mcp-server/config.js';

async function testProject() {
  console.log('=== x402-stacks MCP Server Test ===\n');

  const walletManager = new WalletManager();
  const userId = 'test-user';

  try {
    console.log('1. Testing Wallet Creation...');
    const wallet = await walletManager.getOrCreateWallet(userId);
    console.log(`   ✓ Wallet created: ${wallet.address}`);

    console.log('\n2. Checking Balance...');
    const balance = await walletManager.getBalance(wallet.address);
    const balanceSTX = Number(balance) / 1_000_000;
    console.log(`   ✓ Balance: ${balanceSTX.toFixed(6)} STX (${balance} microSTX)`);

    if (balance === 0n) {
      console.log('\n   ⚠️  WARNING: Wallet has zero balance!');
      console.log(`   Fund your wallet at: https://explorer.hiro.so/sandbox/faucet?chain=testnet&address=${wallet.address}`);
      console.log('   After funding, run this test again.\n');
      return;
    }

    console.log('\n3. Testing Demo Services...');
    
    console.log('\n   Testing Research API (should return 402)...');
    try {
      const response = await fetch(`${config.services.researchApiUrl}/api/research?topic=test`);
      if (response.status === 402) {
        console.log('   ✓ Research API returns 402 Payment Required');
      } else {
        console.log(`   ✗ Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ✗ Research API not running: ${error}`);
      console.log('   Start it with: npm run start:research');
    }

    console.log('\n   Testing Analysis API (should return 402)...');
    try {
      const response = await fetch(`${config.services.analysisApiUrl}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test' })
      });
      if (response.status === 402) {
        console.log('   ✓ Analysis API returns 402 Payment Required');
      } else {
        console.log(`   ✗ Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ✗ Analysis API not running: ${error}`);
      console.log('   Start it with: npm run start:analysis');
    }

    console.log('\n   Testing Market API (should return 402)...');
    try {
      const response = await fetch(`${config.services.marketApiUrl}/api/market?token=STX`);
      if (response.status === 402) {
        console.log('   ✓ Market API returns 402 Payment Required');
      } else {
        console.log(`   ✗ Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ✗ Market API not running: ${error}`);
      console.log('   Start it with: npm run start:market');
    }

    console.log('\n   Testing Translate API (should return 402)...');
    try {
      const response = await fetch(`${config.services.translateApiUrl}/api/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'test', targetLang: 'id' })
      });
      if (response.status === 402) {
        console.log('   ✓ Translate API returns 402 Payment Required');
      } else {
        console.log(`   ✗ Unexpected status: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ✗ Translate API not running: ${error}`);
      console.log('   Start it with: npm run start:translate');
    }

    if (balanceSTX >= 0.01) {
      console.log('\n4. Testing Payment Flow with Research API...');
      console.log('   This will make a real payment on testnet!');
      
      try {
        const response = await fetchWithPayment(
          `${config.services.researchApiUrl}/api/research?topic=bitcoin`,
          { method: 'GET' },
          { userId, walletManager }
        );

        if (response.ok) {
          const data = await response.json();
          console.log('   ✓ Payment successful! Data received:');
          console.log(`   Topic: ${data.topic}`);
          console.log(`   Articles found: ${data.articles.length}`);
          
          const newBalance = await walletManager.getBalance(wallet.address);
          const newBalanceSTX = Number(newBalance) / 1_000_000;
          console.log(`   New balance: ${newBalanceSTX.toFixed(6)} STX`);
        } else {
          console.log(`   ✗ Payment flow failed: ${response.status}`);
        }
      } catch (error) {
        console.log(`   ✗ Payment flow error: ${error}`);
      }
    } else {
      console.log('\n4. Skipping payment test (insufficient balance)');
    }

    console.log('\n=== Test Complete ===');
    console.log('\nNext steps:');
    console.log('1. Ensure all demo services are running');
    console.log('2. Fund your wallet if balance is zero');
    console.log('3. Run this test again to verify payment flow');
    console.log('4. For production use, integrate with Claude Desktop or other MCP clients');

  } catch (error) {
    console.error('\n✗ Test failed:', error);
  } finally {
    walletManager.close();
  }
}

testProject().catch(console.error);
