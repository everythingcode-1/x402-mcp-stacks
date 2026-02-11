import express from 'express';
import { paymentMiddleware } from 'x402-stacks';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3001;

const gate = paymentMiddleware({
  payTo: process.env.RESEARCH_SERVICE_WALLET || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
  amount: '2000',
  tokenType: 'STX',
  network: 'stacks:2147483648',
  facilitatorUrl: process.env.FACILITATOR_URL || 'https://x402-facilitator.stacksx402.com',
  scheme: 'exact',
  maxTimeoutSeconds: 300,
});

app.get('/api/research', gate, (req, res) => {
  const topic = req.query.topic || 'general';
  
  const mockData = {
    topic,
    articles: [
      {
        title: 'Lightning Network reaches 10,000 nodes',
        summary: 'The Lightning Network has achieved a new milestone with over 10,000 active nodes, demonstrating the growing adoption of Bitcoin layer 2 scaling solutions.',
        source: 'Bitcoin Magazine',
        date: '2026-02-10'
      },
      {
        title: 'Stacks Nakamoto upgrade improves finality',
        summary: 'The latest Stacks upgrade brings Bitcoin finality to smart contracts, enabling faster and more secure transactions on the Stacks blockchain.',
        source: 'Stacks Blog',
        date: '2026-02-08'
      },
      {
        title: `Recent developments in ${topic}`,
        summary: `This article explores the latest trends and innovations in ${topic}, providing insights into future directions and potential impacts.`,
        source: 'Research Journal',
        date: '2026-02-11'
      }
    ],
    timestamp: new Date().toISOString()
  };

  res.json(mockData);
});

app.listen(PORT, () => {
  console.log(`Research API running on http://localhost:${PORT}`);
  console.log(`Protected endpoint: GET /api/research?topic={topic}`);
  console.log(`Price: 2000 microSTX (0.002 STX) per call`);
});
