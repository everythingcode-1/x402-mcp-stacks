import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const RegisterTool = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    apiUrl: '',
    price: '',
    priceUnit: 'STX',
    walletAddress: '',
    category: 'general'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3100/api/tools/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/tools'), 2000);
      } else {
        alert('Failed to register tool. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to register tool. Please check if the API server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-success" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Tool Registered!</h2>
          <p className="text-muted-foreground mb-4">
            Your tool has been submitted for review. Redirecting to tools page...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-4">Register Your x402 Tool</h1>
          <p className="text-muted-foreground mb-8">
            Register your API service that supports x402 payment protocol. Once approved, 
            it will be available in the x402-stacks MCP server for AI agents to discover and use.
          </p>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Tool Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Weather Data API"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Description <span className="text-destructive">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Describe what your API does and what data it provides..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  API URL <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  name="apiUrl"
                  value={formData.apiUrl}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="https://api.example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your API must implement x402-stacks payment middleware
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Price per Call <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="1000"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Amount in microSTX (1 STX = 1,000,000 microSTX)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Price Unit
                  </label>
                  <select
                    name="priceUnit"
                    value={formData.priceUnit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="STX">STX</option>
                    <option value="sBTC">sBTC</option>
                    <option value="USDCx">USDCx</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Payment Wallet Address <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
                  placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Stacks wallet address where payments will be sent
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="general">General</option>
                  <option value="data">Data & Analytics</option>
                  <option value="ai">AI & ML</option>
                  <option value="finance">Finance</option>
                  <option value="social">Social</option>
                  <option value="media">Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Register Tool'
                  )}
                </Button>
              </div>
            </form>
          </Card>

          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h3 className="font-bold mb-3">Requirements:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>API must implement x402-stacks payment middleware</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Must return HTTP 402 Payment Required for unpaid requests</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>Must verify payments via x402-stacks facilitator</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                <span>API must be publicly accessible (HTTPS recommended)</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterTool;
