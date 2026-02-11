import { useState } from "react";
import { Menu, X, ChevronRight, Book, Zap, Settings, Code, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CodeCard } from "@/components/CodeCard";

const Documentation = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("quick-start");

  const sections = [
    {
      id: "quick-start",
      title: "Quick Start",
      icon: Zap,
      subsections: [
        { id: "installation", title: "Installation" },
        { id: "basic-usage", title: "Basic Usage" },
      ]
    },
    {
      id: "setup",
      title: "Installation & Setup",
      icon: Settings,
      subsections: [
        { id: "requirements", title: "Requirements" },
        { id: "npm-install", title: "NPM Installation" },
        { id: "environment", title: "Environment Setup" },
        { id: "wallet-setup", title: "Wallet Configuration" },
      ]
    },
    {
      id: "configuration",
      title: "Configuration",
      icon: Settings,
      subsections: [
        { id: "basic-config", title: "Basic Configuration" },
        { id: "advanced-config", title: "Advanced Options" },
        { id: "pricing", title: "Pricing Setup" },
        { id: "free-tier", title: "Free Tier Configuration" },
      ]
    },
    {
      id: "api-reference",
      title: "API Reference",
      icon: Code,
      subsections: [
        { id: "middleware", title: "Middleware API" },
        { id: "verification", title: "Verification Methods" },
        { id: "events", title: "Events & Callbacks" },
        { id: "error-handling", title: "Error Handling" },
      ]
    },
    {
      id: "security",
      title: "Security",
      icon: Shield,
      subsections: [
        { id: "blockchain-verification", title: "Blockchain Verification" },
        { id: "bot-protection", title: "Bot Protection" },
        { id: "rate-limiting", title: "Rate Limiting" },
      ]
    },
    {
      id: "examples",
      title: "Examples & Use Cases",
      icon: Book,
      subsections: [
        { id: "express-example", title: "Express.js Example" },
        { id: "nextjs-example", title: "Next.js Example" },
        { id: "rest-api", title: "REST API Example" },
        { id: "graphql", title: "GraphQL Example" },
      ]
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: AlertCircle,
      subsections: [
        { id: "common-issues", title: "Common Issues" },
        { id: "debugging", title: "Debugging Guide" },
        { id: "faq", title: "FAQ" },
      ]
    },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <h1 className="text-xl font-bold">x402 Guard SDK Documentation</h1>
          </div>
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside
            className={`
              fixed lg:sticky top-[73px] left-0 h-[calc(100vh-73px)] w-64 
              bg-background border-r border-border overflow-y-auto
              transition-transform duration-300 z-40
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}
          >
            <nav className="p-4 space-y-2">
              {sections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => scrollToSection(section.id)}
                    className={`
                      w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                      transition-colors
                      ${activeSection === section.id ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'}
                    `}
                  >
                    <section.icon className="h-4 w-4" />
                    {section.title}
                  </button>
                  <div className="ml-6 mt-1 space-y-1">
                    {section.subsections.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => scrollToSection(sub.id)}
                        className={`
                          w-full text-left px-3 py-1.5 rounded text-xs
                          transition-colors
                          ${activeSection === sub.id ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground'}
                        `}
                      >
                        {sub.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            {/* Quick Start */}
            <section id="quick-start" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
              
              <div id="installation" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Installation</h3>
                <CodeCard 
                  title="terminal"
                  code="npm install x402-guard-sdk"
                />
              </div>

              <div id="basic-usage" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Basic Usage</h3>
                <CodeCard 
                  title="server.js"
                  code={`import { x402Guard } from 'x402-guard-sdk';
import express from 'express';

const app = express();

// Apply x402 Guard middleware
app.use(x402Guard({
  price: 0.01,              // 0.01 STX per request
  freeTier: 10,             // 10 free requests
  wallet: 'SP2J6ZY...'      // Your Stacks wallet address
}));

app.get('/api/data', (req, res) => {
  res.json({ message: 'Protected API endpoint' });
});

app.listen(3000);`}
                />
                <p className="text-sm text-muted-foreground mt-4">
                  That's it! Your API is now protected and monetized with blockchain verification.
                </p>
              </div>
            </section>

            {/* Installation & Setup */}
            <section id="setup" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-6">Installation & Setup</h2>
              
              <div id="requirements" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Requirements</h3>
                <Card className="p-6 bg-card">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span><strong>Node.js:</strong> Version 16.x or higher</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span><strong>Stacks Wallet:</strong> A valid Stacks blockchain wallet address</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                      <span><strong>Framework:</strong> Express.js, Next.js, or any Node.js framework</span>
                    </li>
                  </ul>
                </Card>
              </div>

              <div id="npm-install" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">NPM Installation</h3>
                <p className="mb-4">Install the SDK using npm or yarn:</p>
                <CodeCard 
                  title="terminal"
                  code="npm install x402-guard-sdk"
                />
                <p className="text-sm text-muted-foreground my-2">Or with yarn:</p>
                <CodeCard 
                  title="terminal"
                  code="yarn add x402-guard-sdk"
                />
              </div>

              <div id="environment" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Environment Setup</h3>
                <p className="mb-4">Create a <code className="bg-secondary px-2 py-1 rounded">.env</code> file in your project root:</p>
                <CodeCard 
                  title=".env"
                  code={`X402_WALLET_ADDRESS=SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
X402_PRICE_PER_REQUEST=0.01
X402_FREE_TIER_REQUESTS=10
X402_NETWORK=mainnet`}
                />
              </div>

              <div id="wallet-setup" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Wallet Configuration</h3>
                <Card className="p-6 bg-card">
                  <ol className="space-y-4">
                    <li>
                      <strong>1. Get a Stacks Wallet</strong>
                      <p className="text-sm text-muted-foreground mt-1">
                        Download Hiro Wallet or Xverse Wallet from their official websites.
                      </p>
                    </li>
                    <li>
                      <strong>2. Copy Your Wallet Address</strong>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your wallet address starts with "SP" (mainnet) or "ST" (testnet).
                      </p>
                    </li>
                    <li>
                      <strong>3. Configure SDK</strong>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add your wallet address to the SDK configuration to receive payments.
                      </p>
                    </li>
                  </ol>
                </Card>
              </div>
            </section>

            {/* Configuration */}
            <section id="configuration" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-6">Configuration</h2>
              
              <div id="basic-config" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Basic Configuration</h3>
                <CodeCard 
                  title="config.js"
                  code={`const config = {
  // Required: Your Stacks wallet address
  wallet: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  
  // Required: Price per API request in STX
  price: 0.01,
  
  // Optional: Number of free requests before payment required
  freeTier: 10,
  
  // Optional: Network (mainnet or testnet)
  network: 'mainnet'
};

app.use(x402Guard(config));`}
                />
              </div>

              <div id="advanced-config" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Advanced Options</h3>
                <CodeCard 
                  title="advanced-config.js"
                  code={`const advancedConfig = {
  wallet: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  price: 0.01,
  freeTier: 10,
  
  // Advanced options
  timeout: 30000,              // Request timeout (ms)
  retries: 3,                  // Number of verification retries
  cacheDuration: 3600,         // Cache duration (seconds)
  
  // Custom error messages
  errorMessages: {
    paymentRequired: 'Payment required to access this endpoint',
    invalidPayment: 'Invalid payment proof',
    insufficientFunds: 'Insufficient payment amount'
  },
  
  // Webhook for payment notifications
  webhook: 'https://yourapi.com/webhook/payment',
  
  // Custom verification logic
  onVerify: async (payment) => {
    console.log('Payment verified:', payment);
    return true;
  }
};`}
                />
              </div>

              <div id="pricing" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Pricing Setup</h3>
                <p className="mb-4">Configure different pricing tiers for your API:</p>
                <CodeCard 
                  title="pricing.js"
                  code={`// Single price for all endpoints
app.use(x402Guard({ price: 0.01, wallet: '...' }));

// Different prices for different routes
app.use('/api/basic', x402Guard({ price: 0.001, wallet: '...' }));
app.use('/api/premium', x402Guard({ price: 0.05, wallet: '...' }));
app.use('/api/enterprise', x402Guard({ price: 0.1, wallet: '...' }));`}
                />
              </div>

              <div id="free-tier" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Free Tier Configuration</h3>
                <p className="mb-4">Offer free requests before requiring payment:</p>
                <CodeCard 
                  title="free-tier.js"
                  code={`app.use(x402Guard({
  wallet: 'SP2J6ZY...',
  price: 0.01,
  freeTier: 10,           // First 10 requests are free
  freeTierPeriod: 'day'   // Reset daily (day/week/month)
}));`}
                />
                <p className="text-sm text-muted-foreground mt-4">
                  Free tier is tracked per IP address or wallet address.
                </p>
              </div>
            </section>

            {/* API Reference */}
            <section id="api-reference" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-6">API Reference</h2>
              
              <div id="middleware" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Middleware API</h3>
                <Card className="p-6 bg-card">
                  <h4 className="font-semibold mb-3">x402Guard(config)</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Main middleware function that protects your API endpoints.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Parameters:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mt-2">
                        <li><code>config.wallet</code> (string, required) - Your Stacks wallet address</li>
                        <li><code>config.price</code> (number, required) - Price per request in STX</li>
                        <li><code>config.freeTier</code> (number, optional) - Number of free requests</li>
                        <li><code>config.network</code> (string, optional) - 'mainnet' or 'testnet'</li>
                        <li><code>config.timeout</code> (number, optional) - Request timeout in ms</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium">Returns:</p>
                      <p className="text-sm text-muted-foreground">Express middleware function</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div id="verification" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Verification Methods</h3>
                <CodeCard 
                  title="verification.js"
                  code={`import { verifyPayment, getPaymentStatus } from 'x402-guard-sdk';

// Verify a payment manually
const isValid = await verifyPayment({
  txId: 'transaction-id',
  wallet: 'SP2J6ZY...',
  amount: 0.01
});

// Get payment status
const status = await getPaymentStatus('transaction-id');
console.log(status); // { verified: true, amount: 0.01, timestamp: ... }`}
                />
              </div>

              <div id="events" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Events & Callbacks</h3>
                <CodeCard 
                  title="events.js"
                  code={`app.use(x402Guard({
  wallet: 'SP2J6ZY...',
  price: 0.01,
  
  // Called when payment is verified
  onVerify: async (payment) => {
    console.log('Payment verified:', payment);
    // Custom logic here
  },
  
  // Called when payment fails
  onError: async (error) => {
    console.error('Payment error:', error);
    // Custom error handling
  },
  
  // Called for each request
  onRequest: async (req) => {
    console.log('Request received:', req.path);
  }
}));`}
                />
              </div>

              <div id="error-handling" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Error Handling</h3>
                <Card className="p-6 bg-card">
                  <p className="mb-4">The SDK returns standard HTTP error codes:</p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <code className="bg-secondary px-2 py-1 rounded">402</code>
                      <span>Payment Required - User needs to pay to access endpoint</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <code className="bg-secondary px-2 py-1 rounded">400</code>
                      <span>Bad Request - Invalid payment proof or missing headers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <code className="bg-secondary px-2 py-1 rounded">401</code>
                      <span>Unauthorized - Payment verification failed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <code className="bg-secondary px-2 py-1 rounded">429</code>
                      <span>Too Many Requests - Rate limit exceeded</span>
                    </li>
                  </ul>
                  <CodeCard 
                    title="error-handler.js"
                    code={`// Custom error handling
app.use((err, req, res, next) => {
  if (err.code === 'X402_PAYMENT_REQUIRED') {
    res.status(402).json({
      error: 'Payment required',
      price: '0.01 STX',
      wallet: 'SP2J6ZY...'
    });
  }
});`}
                  />
                </Card>
              </div>
            </section>

            {/* Security */}
            <section id="security" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-6">Security</h2>
              
              <div id="blockchain-verification" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Blockchain Verification</h3>
                <Card className="p-6 bg-card">
                  <p className="mb-4">Every payment is verified on the Stacks blockchain:</p>
                  <ol className="space-y-3 text-sm">
                    <li><strong>1. Client sends payment transaction</strong> - User pays via Stacks wallet</li>
                    <li><strong>2. Transaction confirmed on blockchain</strong> - Stacks network confirms TX</li>
                    <li><strong>3. SDK verifies transaction</strong> - Checks amount, recipient, and status</li>
                    <li><strong>4. Access granted</strong> - API request proceeds if valid</li>
                  </ol>
                  <p className="text-sm text-muted-foreground mt-4">
                    All verifications are cryptographically secure and tamper-proof.
                  </p>
                </Card>
              </div>

              <div id="bot-protection" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Bot Protection</h3>
                <p className="mb-4">Built-in AI-powered bot detection:</p>
                <CodeCard 
                  title="bot-protection.js"
                  code={`app.use(x402Guard({
  wallet: 'SP2J6ZY...',
  price: 0.01,
  
  // Enable bot protection
  botProtection: {
    enabled: true,
    threshold: 0.8,        // Confidence threshold (0-1)
    action: 'block'        // 'block' or 'challenge'
  }
}));`}
                />
                <p className="text-sm text-muted-foreground mt-4">
                  Bot protection analyzes request patterns and blocks suspicious traffic.
                </p>
              </div>

              <div id="rate-limiting" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Rate Limiting</h3>
                <CodeCard 
                  title="rate-limit.js"
                  code={`app.use(x402Guard({
  wallet: 'SP2J6ZY...',
  price: 0.01,
  
  // Rate limiting configuration
  rateLimit: {
    windowMs: 60000,       // 1 minute window
    maxRequests: 100,      // Max 100 requests per window
    skipPaid: true         // Skip rate limit for paid requests
  }
}));`}
                />
              </div>
            </section>

            {/* Examples & Use Cases */}
            <section id="examples" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-6">Examples & Use Cases</h2>
              
              <div id="express-example" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Express.js Example</h3>
                <CodeCard 
                  title="express-server.js"
                  code={`import express from 'express';
import { x402Guard } from 'x402-guard-sdk';

const app = express();

// Public endpoint (no payment required)
app.get('/api/public', (req, res) => {
  res.json({ message: 'Public data' });
});

// Protected endpoint
app.use('/api/protected', x402Guard({
  wallet: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  price: 0.01,
  freeTier: 5
}));

app.get('/api/protected/data', (req, res) => {
  res.json({ 
    message: 'Protected data',
    premium: true 
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`}
                />
              </div>

              <div id="nextjs-example" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Next.js Example</h3>
                <CodeCard 
                  title="pages/api/protected.ts"
                  code={`// pages/api/protected.ts
import { x402Guard } from 'x402-guard-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

const guard = x402Guard({
  wallet: process.env.X402_WALLET!,
  price: 0.01,
  freeTier: 10
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Apply x402 Guard
  await guard(req, res, () => {
    // Your API logic here
    res.status(200).json({ 
      message: 'Protected API data',
      timestamp: new Date().toISOString()
    });
  });
}`}
                />
              </div>

              <div id="rest-api" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">REST API Example</h3>
                <CodeCard 
                  title="rest-api.js"
                  code={`// Complete REST API with x402 Guard
import express from 'express';
import { x402Guard } from 'x402-guard-sdk';

const app = express();
app.use(express.json());

const guard = x402Guard({
  wallet: 'SP2J6ZY...',
  price: 0.01,
  freeTier: 10
});

// CRUD operations
app.get('/api/items', guard, async (req, res) => {
  const items = await db.items.findAll();
  res.json(items);
});

app.post('/api/items', guard, async (req, res) => {
  const item = await db.items.create(req.body);
  res.status(201).json(item);
});

app.put('/api/items/:id', guard, async (req, res) => {
  const item = await db.items.update(req.params.id, req.body);
  res.json(item);
});

app.delete('/api/items/:id', guard, async (req, res) => {
  await db.items.delete(req.params.id);
  res.status(204).send();
});

app.listen(3000);`}
                />
              </div>

              <div id="graphql" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">GraphQL Example</h3>
                <CodeCard 
                  title="graphql-server.js"
                  code={`import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { x402Guard } from 'x402-guard-sdk';

const server = new ApolloServer({
  typeDefs,
  resolvers
});

await server.start();

app.use(
  '/graphql',
  x402Guard({
    wallet: 'SP2J6ZY...',
    price: 0.01,
    freeTier: 10
  }),
  expressMiddleware(server)
);`}
                />
              </div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-bold mb-6">Troubleshooting</h2>
              
              <div id="common-issues" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Common Issues</h3>
                <Card className="p-6 bg-card">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Payment verification fails</h4>
                      <p className="text-sm text-muted-foreground mb-2">Possible causes:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Transaction not confirmed on blockchain yet (wait 1-2 minutes)</li>
                        <li>Wrong wallet address in configuration</li>
                        <li>Insufficient payment amount</li>
                        <li>Network mismatch (mainnet vs testnet)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">402 Payment Required error</h4>
                      <p className="text-sm text-muted-foreground">
                        This is expected behavior. Client needs to send payment proof in request headers.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Free tier not working</h4>
                      <p className="text-sm text-muted-foreground mb-2">Check:</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        <li>Free tier is configured correctly in SDK options</li>
                        <li>IP address or wallet tracking is enabled</li>
                        <li>Free tier period hasn't expired</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>

              <div id="debugging" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">Debugging Guide</h3>
                <p className="mb-4">Enable debug mode to see detailed logs:</p>
                <CodeCard 
                  title="debug-config.js"
                  code={`app.use(x402Guard({
  wallet: 'SP2J6ZY...',
  price: 0.01,
  debug: true,              // Enable debug logging
  logLevel: 'verbose'       // verbose | info | warn | error
}));`}
                />
                <p className="text-sm text-muted-foreground mt-4">
                  Debug logs will show payment verification steps, blockchain queries, and error details.
                </p>
              </div>

              <div id="faq" className="mb-8 scroll-mt-20">
                <h3 className="text-2xl font-semibold mb-4">FAQ</h3>
                <Card className="p-6 bg-card">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">How long does payment verification take?</h4>
                      <p className="text-sm text-muted-foreground">
                        Typically 1-2 minutes for blockchain confirmation. The SDK caches verified payments for faster subsequent requests.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Can I use this with serverless functions?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes! The SDK works with AWS Lambda, Vercel Functions, and other serverless platforms.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">What happens if the blockchain is down?</h4>
                      <p className="text-sm text-muted-foreground">
                        The SDK has built-in retry logic and fallback mechanisms. You can configure timeout and retry settings.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">How do I handle refunds?</h4>
                      <p className="text-sm text-muted-foreground">
                        Refunds must be handled manually through your Stacks wallet. The SDK provides payment tracking to help identify transactions.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Is there a transaction fee?</h4>
                      <p className="text-sm text-muted-foreground">
                        Yes, Stacks blockchain charges a small network fee (typically 0.0001-0.001 STX) per transaction, paid by the sender.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </section>

            {/* Footer */}
            <div className="border-t border-border pt-8 mt-16">
              <p className="text-center text-muted-foreground">
                Need more help? Join our{" "}
                <a href="#" className="text-primary hover:underline">Discord community</a>
                {" "}or{" "}
                <a href="#" className="text-primary hover:underline">open an issue on GitHub</a>
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
