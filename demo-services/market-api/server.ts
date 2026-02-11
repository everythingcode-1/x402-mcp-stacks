import express from 'express';
import { paymentMiddleware } from 'x402-stacks';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3003;

const gate = paymentMiddleware({
  payTo: process.env.MARKET_SERVICE_WALLET || 'ST2JHG361ZXG51QTKY2NQCVBPPRRE2KZB1HR05NNC',
  amount: '1000',
  tokenType: 'STX',
  network: 'stacks:2147483648',
  facilitatorUrl: process.env.FACILITATOR_URL || 'https://x402-facilitator.stacksx402.com',
  scheme: 'exact',
  maxTimeoutSeconds: 300,
});

app.get('/api/market', gate, (req, res) => {
  const token = (req.query.token as string || 'STX').toUpperCase();
  
  const marketData: Record<string, any> = {
    'STX': {
      token: 'STX',
      priceUSD: 1.24,
      change24h: '+3.2%',
      volume24h: '45,230,000',
      marketCap: '1,820,000,000',
    },
    'SBTC': {
      token: 'sBTC',
      priceUSD: 42150.50,
      change24h: '+1.8%',
      volume24h: '2,340,000',
      marketCap: '850,000,000',
    },
    'USDCX': {
      token: 'USDCx',
      priceUSD: 1.00,
      change24h: '+0.01%',
      volume24h: '12,500,000',
      marketCap: '500,000,000',
    }
  };

  const data = marketData[token] || marketData['STX'];
  
  res.json({
    ...data,
    source: 'x402-market-oracle',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Market API running on http://localhost:${PORT}`);
  console.log(`Protected endpoint: GET /api/market?token={token}`);
  console.log(`Price: 1000 microSTX (0.001 STX) per call`);
});
