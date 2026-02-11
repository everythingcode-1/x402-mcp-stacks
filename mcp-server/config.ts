import dotenv from 'dotenv';

dotenv.config();

export const config = {
  stacksNetwork: process.env.STACKS_NETWORK || 'testnet',
  facilitatorUrl: process.env.FACILITATOR_URL || 'https://x402-facilitator.stacksx402.com',
  walletDbPath: process.env.WALLET_DB_PATH || './wallets.db',
  walletEncryptionSecret: process.env.WALLET_ENCRYPTION_SECRET || '',
  
  services: {
    researchApiUrl: process.env.RESEARCH_API_URL || 'http://localhost:3001',
    analysisApiUrl: process.env.ANALYSIS_API_URL || 'http://localhost:3002',
    marketApiUrl: process.env.MARKET_API_URL || 'http://localhost:3003',
    translateApiUrl: process.env.TRANSLATE_API_URL || 'http://localhost:3004',
  },
  
  serviceWallets: {
    research: process.env.RESEARCH_SERVICE_WALLET || '',
    analysis: process.env.ANALYSIS_SERVICE_WALLET || '',
    market: process.env.MARKET_SERVICE_WALLET || '',
    translate: process.env.TRANSLATE_SERVICE_WALLET || '',
  }
};

if (!config.walletEncryptionSecret || config.walletEncryptionSecret.length < 32) {
  console.error('[CONFIG] WARNING: WALLET_ENCRYPTION_SECRET must be at least 32 characters long');
}
