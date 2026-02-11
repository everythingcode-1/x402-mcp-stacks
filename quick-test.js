import { WalletManager } from './dist/mcp-server/core/walletManager.js';

console.log('=== Quick Test x402-stacks Project ===\n');

const walletManager = new WalletManager();

try {
  console.log('1. Testing Wallet Creation...');
  const wallet = await walletManager.getOrCreateWallet('test-user');
  console.log('   ✓ Wallet Address:', wallet.address);

  console.log('\n2. Checking Balance...');
  const balance = await walletManager.getBalance(wallet.address);
  const balanceSTX = Number(balance) / 1_000_000;
  console.log('   ✓ Balance:', balanceSTX.toFixed(6), 'STX');
  console.log('   ✓ Balance (microSTX):', balance.toString());

  if (balance === 0n) {
    console.log('\n⚠️  Wallet needs funding!');
    console.log('Fund at: https://explorer.hiro.so/sandbox/faucet?chain=testnet');
    console.log('Address:', wallet.address);
  } else {
    console.log('\n✓ Wallet has sufficient balance for testing!');
  }

  console.log('\n=== Test Complete ===');
  console.log('\nNext Steps:');
  console.log('1. Start demo services: npm run start:all-services');
  console.log('2. Fund wallet if balance is 0');
  console.log('3. Test payment flow by calling the services');

} catch (error) {
  console.error('\n✗ Error:', error.message);
} finally {
  walletManager.close();
}
