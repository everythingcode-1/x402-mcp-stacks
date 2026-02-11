import { useState } from "react";
import { Menu, X, ChevronRight, Book, Zap, Settings, Code, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
            <section id="quick-start" className="mb-16">
              <h2 className="text-3xl font-bold mb-6">Quick Start</h2>
              
              <div id="installation" className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Installation</h3>
                <Card className="p-6 bg-card">
                  <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto">
                    <code>npm install x402-guard-sdk</code>
                  </pre>
                </Card>
              </div>

              <div id="basic-usage" className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Basic Usage</h3>
                <Card className="p-6 bg-card">
                  <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`import { x402Guard } from 'x402-guard-sdk';
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

app.listen(3000);`}</code>
                  </pre>
                  <p className="text-sm text-muted-foreground mt-4">
                    That's it! Your API is now protected and monetized with blockchain verification.
                  </p>
                </Card>
              </div>
            </section>

            {/* Installation & Setup */}
            <section id="setup" className="mb-16">
              <h2 className="text-3xl font-bold mb-6">Installation & Setup</h2>
              
              <div id="requirements" className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Requirements</h3>
                <Card className="p-6 bg-card">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <span><strong>Node.js:</strong> Version 16.x or higher</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <span><strong>Stacks Wallet:</strong> A valid Stacks blockchain wallet address</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                      <span><strong>Framework:</strong> Express.js, Next.js, or any Node.js framework</span>
                    </li>
                  </ul>
                </Card>
              </div>

              <div id="npm-install" className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">NPM Installation</h3>
                <Card className="p-6 bg-card">
                  <p className="mb-4">Install the SDK using npm or yarn:</p>
                  <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto mb-4">
                    <code>npm install x402-guard-sdk</code>
                  </pre>
                  <p className="text-sm text-muted-foreground mb-2">Or with yarn:</p>
                  <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto">
                    <code>yarn add x402-guard-sdk</code>
                  </pre>
                </Card>
              </div>

              <div id="environment" className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Environment Setup</h3>
                <Card className="p-6 bg-card">
                  <p className="mb-4">Create a <code className="bg-secondary px-2 py-1 rounded">.env</code> file in your project root:</p>
                  <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto">
                    <code>{`X402_WALLET_ADDRESS=SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7
X402_PRICE_PER_REQUEST=0.01
X402_FREE_TIER_REQUESTS=10
X402_NETWORK=mainnet`}</code>
                  </pre>
                </Card>
              </div>

              <div id="wallet-setup" className="mb-8">
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
            <section id="configuration" className="mb-16">
              <h2 className="text-3xl font-bold mb-6">Configuration</h2>
              
              <div id="basic-config" className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Basic Configuration</h3>
                <Card className="p-6 bg-card">
                  <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`const config = {
  // Required: Your Stacks wallet address
  wallet: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7',
  
  // Required: Price per API request in STX
  price: 0.01,
  
  // Optional: Number of free requests before payment required
  freeTier: 10,
  
  // Optional: Network (mainnet or testnet)
  network: 'mainnet'
};

app.use(x402Guard(config));`}</code>
                  </pre>
                </Card>
              </div>

              <div id="advanced-config" className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Advanced Options</h3>
                <Card className="p-6 bg-card">
                  <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`const advancedConfig = {
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
};`}</code>
                  </pre>
                </Card>
              </div>

              <div id="pricing" className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Pricing Setup</h3>
                <Card className="p-6 bg-card">
                  <p className="mb-4">Configure different pricing tiers for your API:</p>
                  <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`// Single price for all endpoints
app.use(x402Guard({ price: 0.01, wallet: '...' }));

// Different prices for different routes
app.use('/api/basic', x402Guard({ price: 0.001, wallet: '...' }));
app.use('/api/premium', x402Guard({ price: 0.05, wallet: '...' }));
app.use('/api/enterprise', x402Guard({ price: 0.1, wallet: '...' }));`}</code>
                  </pre>
                </Card>
              </div>

              <div id="free-tier" className="mb-8">
                <h3 className="text-2xl font-semibold mb-4">Free Tier Configuration</h3>
                <Card className="p-6 bg-card">
                  <p className="mb-4">Offer free requests before requiring payment:</p>
                  <pre className="bg-black text-white p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`app.use(x402Guard({
  wallet: 'SP2J6ZY...',
  price: 0.01,
  freeTier: 10,           // First 10 requests are free
  freeTierPeriod: 'day'   // Reset daily (day/week/month)
}));`}</code>
                  </pre>
                  <p className="text-sm text-muted-foreground mt-4">
                    Free tier is tracked per IP address or wallet address.
                  </p>
                </Card>
              </div>
            </section>

            {/* API Reference - Continue in next message due to length */}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
