import express from 'express';
import { paymentMiddleware } from 'x402-stacks';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
const PORT = 3004;

const gate = paymentMiddleware({
  payTo: process.env.TRANSLATE_SERVICE_WALLET || 'ST2NEB84ASENDXKYGJPQW86YXQCEFEX2ZQPG87ND',
  amount: '1000',
  tokenType: 'STX',
  network: 'stacks:2147483648',
  facilitatorUrl: process.env.FACILITATOR_URL || 'https://x402-facilitator.stacksx402.com',
  scheme: 'exact',
  maxTimeoutSeconds: 300,
});

const translations: Record<string, Record<string, string>> = {
  'id': {
    'Bitcoin is the future of money': 'Bitcoin adalah masa depan uang',
    'Stacks brings smart contracts to Bitcoin': 'Stacks membawa kontrak pintar ke Bitcoin',
    'The Lightning Network enables fast payments': 'Lightning Network memungkinkan pembayaran cepat',
    'hello': 'halo',
    'thank you': 'terima kasih',
  },
  'es': {
    'Bitcoin is the future of money': 'Bitcoin es el futuro del dinero',
    'Stacks brings smart contracts to Bitcoin': 'Stacks trae contratos inteligentes a Bitcoin',
    'The Lightning Network enables fast payments': 'Lightning Network permite pagos rápidos',
    'hello': 'hola',
    'thank you': 'gracias',
  },
  'fr': {
    'Bitcoin is the future of money': 'Bitcoin est l\'avenir de l\'argent',
    'Stacks brings smart contracts to Bitcoin': 'Stacks apporte des contrats intelligents à Bitcoin',
    'The Lightning Network enables fast payments': 'Lightning Network permet des paiements rapides',
    'hello': 'bonjour',
    'thank you': 'merci',
  },
  'ja': {
    'Bitcoin is the future of money': 'ビットコインはお金の未来です',
    'Stacks brings smart contracts to Bitcoin': 'Stacksはビットコインにスマートコントラクトをもたらします',
    'The Lightning Network enables fast payments': 'ライトニングネットワークは高速支払いを可能にします',
    'hello': 'こんにちは',
    'thank you': 'ありがとう',
  }
};

app.post('/api/translate', gate, (req, res) => {
  const text = req.body.text || '';
  const targetLang = req.body.targetLang || 'id';
  
  const langTranslations = translations[targetLang] || translations['id'];
  
  let translatedText = langTranslations[text] || langTranslations[text.toLowerCase()];
  
  if (!translatedText) {
    const words = text.toLowerCase().split(' ');
    translatedText = words.map((word: string) => langTranslations[word] || word).join(' ');
  }

  res.json({
    originalText: text,
    translatedText,
    targetLang,
    confidence: 0.95
  });
});

app.listen(PORT, () => {
  console.log(`Translate API running on http://localhost:${PORT}`);
  console.log(`Protected endpoint: POST /api/translate`);
  console.log(`Price: 1000 microSTX (0.001 STX) per call`);
});
