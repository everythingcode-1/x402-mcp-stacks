import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Coins, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface Tool {
  id: string;
  name: string;
  description: string;
  apiUrl: string;
  price: string;
  priceUnit: string;
  walletAddress: string;
  category: string;
  createdAt: string;
}

const ToolsListing = () => {
  const navigate = useNavigate();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const response = await fetch('http://localhost:3100/api/tools');
      if (response.ok) {
        const data = await response.json();
        setTools(data);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: string, unit: string) => {
    const microSTX = parseFloat(price);
    const stx = microSTX / 1_000_000;
    return `${stx.toFixed(6)} ${unit}`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      data: 'bg-blue-500/10 text-blue-500',
      ai: 'bg-purple-500/10 text-purple-500',
      finance: 'bg-green-500/10 text-green-500',
      social: 'bg-pink-500/10 text-pink-500',
      media: 'bg-orange-500/10 text-orange-500',
      general: 'bg-gray-500/10 text-gray-500',
      other: 'bg-gray-500/10 text-gray-500'
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-4xl font-bold mb-2">Available x402 Tools</h1>
            <p className="text-muted-foreground">
              Browse and discover AI-accessible APIs powered by x402-stacks payment protocol
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => navigate('/register')}
          >
            Register Your Tool
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-muted-foreground">Loading tools...</p>
          </div>
        ) : tools.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No tools registered yet.</p>
            <Button onClick={() => navigate('/register')}>
              Be the first to register a tool
            </Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full flex flex-col hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{tool.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${getCategoryColor(tool.category)}`}>
                        {tool.category}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 flex-grow">
                    {tool.description}
                  </p>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        Price per call
                      </span>
                      <span className="font-semibold text-primary">
                        {formatPrice(tool.price, tool.priceUnit)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Endpoint</span>
                      <a
                        href={tool.apiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 font-mono text-xs"
                      >
                        View API
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          navigator.clipboard.writeText(tool.apiUrl);
                          alert('API URL copied to clipboard!');
                        }}
                      >
                        Copy API URL
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-12 p-8 bg-muted/50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">How to Use These Tools</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">1</span>
                For AI Agents (via MCP)
              </h3>
              <p className="text-sm text-muted-foreground">
                These tools are automatically available in the x402-stacks MCP server. 
                AI agents like Claude can discover and use them autonomously with automatic payment.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">2</span>
                For Developers
              </h3>
              <p className="text-sm text-muted-foreground">
                Use the fetchWithPayment function from x402-stacks SDK to call these APIs. 
                Payment is handled automatically when you receive a 402 response.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsListing;
