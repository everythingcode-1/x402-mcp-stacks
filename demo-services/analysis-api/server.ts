import express from 'express';
import { paymentMiddleware } from 'x402-stacks';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
const PORT = 3002;

const gate = paymentMiddleware({
  payTo: process.env.ANALYSIS_SERVICE_WALLET || 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG',
  amount: '5000',
  tokenType: 'STX',
  network: 'stacks:2147483648',
  facilitatorUrl: process.env.FACILITATOR_URL || 'https://x402-facilitator.stacksx402.com',
  scheme: 'exact',
  maxTimeoutSeconds: 300,
});

app.post('/api/analyze', gate, (req, res) => {
  const text = req.body.text || '';
  
  const words = text.split(/\s+/).filter((w: string) => w.length > 0);
  const wordCount = words.length;
  
  const positiveWords = ['good', 'great', 'excellent', 'positive', 'amazing', 'wonderful', 'bitcoin', 'stacks', 'growth'];
  const negativeWords = ['bad', 'poor', 'negative', 'terrible', 'awful', 'decline', 'crash'];
  
  const textLower = text.toLowerCase();
  const positiveCount = positiveWords.filter(w => textLower.includes(w)).length;
  const negativeCount = negativeWords.filter(w => textLower.includes(w)).length;
  
  let sentiment = 'neutral';
  let confidence = 0.5;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
    confidence = Math.min(0.95, 0.6 + (positiveCount * 0.1));
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    confidence = Math.min(0.95, 0.6 + (negativeCount * 0.1));
  }
  
  const entities = ['Bitcoin', 'Stacks', 'Lightning Network', 'STX', 'Blockchain']
    .filter(entity => textLower.includes(entity.toLowerCase()));

  const mockAnalysis = {
    sentiment,
    confidence,
    entities,
    summary: `The text discusses ${sentiment} developments in ${entities.length > 0 ? entities.join(', ') : 'various topics'}.`,
    wordCount
  };

  res.json(mockAnalysis);
});

app.listen(PORT, () => {
  console.log(`Analysis API running on http://localhost:${PORT}`);
  console.log(`Protected endpoint: POST /api/analyze`);
  console.log(`Price: 5000 microSTX (0.005 STX) per call`);
});
