import { motion } from "framer-motion";
import { ArrowRight, Code2, Shield, Zap, TrendingUp, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Terminal, TypingAnimation, AnimatedSpan } from "@/components/magicui/terminal";
import { InteractiveGridPattern } from "@/components/magicui/interactive-grid-pattern";
import { MorphingText } from "@/components/magicui/morphing-text";
import { AnimatedBeamDemo } from "@/components/AnimatedBeamDemo";
import { DotPattern } from "@/components/magicui/dot-pattern";
import { cn } from "@/lib/utils";

const morphingTexts = [
  "Discover",
  "Pay",
  "Access",
  "Automate",
  "Scale",
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Full Background */}
        <div className="absolute inset-0 z-0">
          <InteractiveGridPattern
            className={cn(
              "[mask-image:radial-gradient(700px_circle_at_center,white,transparent)]",
              "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
            )}
          />
          {/* Glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm text-foreground font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              AI Agents Meet Bitcoin Payments
            </div>
          </motion.div>

          <motion.h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <MorphingText texts={morphingTexts} className="text-foreground font-bold" /> APIs with{" "}
            <span className="text-foreground">Autonomous Payments</span>
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            x402-stacks MCP Server — The first Model Context Protocol server enabling AI agents to autonomously discover and pay for API services using Bitcoin-secured STX. No human intervention required.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <ShimmerButton 
              className="shadow-2xl"
              onClick={() => window.location.href = '/tools'}
            >
              <span className="text-center text-sm leading-none font-medium tracking-tight whitespace-pre-wrap text-white lg:text-lg">
                Browse Tools
              </span>
            </ShimmerButton>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base px-8 py-6 font-semibold border-border hover:bg-secondary"
              onClick={() => window.location.href = '/register'}
            >
              <Code2 className="mr-2 h-4 w-4" />
              Register Your Tool
            </Button>
          </motion.div>

          {/* Terminal Demo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="max-w-3xl mx-auto"
          >
            <Terminal>
              <TypingAnimation duration={30} delay={0}>$ npm install</TypingAnimation>
              <AnimatedSpan className="text-green-500" delay={1000}>Installing x402-stacks MCP dependencies</AnimatedSpan>
              <AnimatedSpan className="text-green-500" delay={1400}>Setting up wallet manager</AnimatedSpan>
              <AnimatedSpan className="text-green-500" delay={1800}>Configuring payment handler</AnimatedSpan>
              <TypingAnimation duration={30} delay={2200}>$ npm run start:mcp</TypingAnimation>
              <AnimatedSpan className="text-blue-500" delay={3000}>[MCP Server] Starting x402-stacks-agent...</AnimatedSpan>
              <AnimatedSpan className="text-blue-500" delay={3200}>[MCP Server] Network: testnet</AnimatedSpan>
              <AnimatedSpan className="text-blue-500" delay={3400}>[MCP Server] Wallet: ST31ADS031FDKS...</AnimatedSpan>
              <AnimatedSpan className="text-blue-500" delay={3600}>[MCP Server] Balance: 300.000000 STX</AnimatedSpan>
              <AnimatedSpan className="text-green-500" delay={3800}>[MCP Server] Ready to accept requests</AnimatedSpan>
            </Terminal>
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 px-4 bg-black text-white overflow-hidden">
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
            "fill-white/20"
          )}
        />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-white">How x402-stacks MCP Works</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              AI agents discover registered tools, automatically pay with STX when they hit 402 responses, and get instant access to data.
            </p>
          </div>

          <AnimatedBeamDemo />

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-white">1</span>
              </div>
              <h3 className="font-bold mb-2 text-white">AI Agent Request</h3>
              <p className="text-sm text-gray-400">
                Claude or other AI agent calls MCP tool to access data
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-white">2</span>
              </div>
              <h3 className="font-bold mb-2 text-white">Automatic Payment</h3>
              <p className="text-sm text-gray-400">
                MCP server detects 402, pays with STX, retries request
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-success">3</span>
              </div>
              <h3 className="font-bold mb-2 text-white">Data Delivered</h3>
              <p className="text-sm text-gray-400">
                Payment verified on-chain, API returns data to AI agent
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why x402-stacks MCP?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              The first MCP server enabling true AI agent autonomy with Bitcoin-secured payments. Register your tools, let AI agents discover and pay automatically.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-4">
            {/* Technical Virality */}
            <Card className="col-span-12 sm:col-span-6 lg:col-span-3 h-[280px] relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all" />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-2">AI-First</p>
                  <h3 className="text-xl font-bold mb-3">Autonomous Discovery</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-auto">
                  AI agents automatically discover registered tools from database. No manual configuration needed.
                </p>
              </div>
            </Card>

            {/* On-Chain Proof */}
            <Card className="col-span-12 sm:col-span-6 lg:col-span-3 h-[280px] relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-success/10 group-hover:from-success/10 group-hover:to-success/20 transition-all" />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6 text-success" />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Bitcoin-Secured</p>
                  <h3 className="text-xl font-bold mb-3">On-Chain Payments</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-auto">
                  Every API call = 1 STX transaction. Verifiable on Stacks blockchain, secured by Bitcoin.
                </p>
              </div>
            </Card>

            {/* Network Effect */}
            <Card className="col-span-12 sm:col-span-6 lg:col-span-3 h-[280px] relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-warning/5 to-warning/10 group-hover:from-warning/10 group-hover:to-warning/20 transition-all" />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-6 w-6 text-warning" />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Tool Registry</p>
                  <h3 className="text-xl font-bold mb-3">Open Marketplace</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-auto">
                  Register your x402 tools. AI agents discover them automatically. Get paid in STX.
                </p>
              </div>
            </Card>

            {/* Instant Setup */}
            <Card className="col-span-12 sm:col-span-6 lg:col-span-3 h-[280px] relative overflow-hidden group hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 group-hover:from-primary/10 group-hover:to-primary/20 transition-all" />
              <div className="relative z-10 p-6 h-full flex flex-col">
                <div className="mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Code2 className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Zero Intervention</p>
                  <h3 className="text-xl font-bold mb-3">Fully Autonomous</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-auto">
                  AI agents handle everything: discovery, payment, retry. Humans just watch it work.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">x402-stacks MCP Advantages</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Feature</th>
                  <th className="text-left py-4 px-6 text-muted-foreground font-semibold">Manual Integration</th>
                  <th className="text-left py-4 px-6 text-primary font-semibold">x402-stacks MCP</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-6 font-semibold">AI Integration</td>
                  <td className="py-4 px-6 text-muted-foreground">Manual coding required</td>
                  <td className="py-4 px-6 text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Automatic via MCP
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-6 font-semibold">Payment Flow</td>
                  <td className="py-4 px-6 text-muted-foreground">User approval needed</td>
                  <td className="py-4 px-6 text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Fully autonomous
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-6 font-semibold">Tool Discovery</td>
                  <td className="py-4 px-6 text-muted-foreground">Hardcoded endpoints</td>
                  <td className="py-4 px-6 text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Database registry
                  </td>
                </tr>
                <tr className="border-b border-border/50">
                  <td className="py-4 px-6 font-semibold">Blockchain</td>
                  <td className="py-4 px-6 text-muted-foreground">Optional</td>
                  <td className="py-4 px-6 text-primary flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Bitcoin-secured STX
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 border-t border-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Register Your Tool?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Make your x402-protected API discoverable by AI agents. Get paid in STX automatically.
          </p>
          <Button 
            size="lg" 
            className="text-base px-8 py-6 font-semibold shadow-[0_0_30px_-5px_hsl(190_100%_50%_/_0.4)]"
            onClick={() => window.location.href = '/register'}
          >
            Register Your Tool
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">
            Built for <span className="text-primary font-semibold">Stacks x402 Hackathon 2026</span>
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            x402-stacks MCP Server — AI Agents Meet Bitcoin Payments
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
