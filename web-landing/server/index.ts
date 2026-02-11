import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.API_PORT || 3100;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'x402-stacks MCP Registry API' });
});

// Get all registered tools
app.get('/api/tools', async (req, res) => {
  try {
    const tools = await prisma.registeredTool.findMany({
      where: { status: 'approved' },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    res.status(500).json({ error: 'Failed to fetch tools' });
  }
});

// Get single tool by ID
app.get('/api/tools/:id', async (req, res) => {
  try {
    const tool = await prisma.registeredTool.findUnique({
      where: { id: req.params.id }
    });
    
    if (!tool) {
      return res.status(404).json({ error: 'Tool not found' });
    }
    
    res.json(tool);
  } catch (error) {
    console.error('Error fetching tool:', error);
    res.status(500).json({ error: 'Failed to fetch tool' });
  }
});

// Register a new tool
app.post('/api/tools/register', async (req, res) => {
  try {
    const { name, description, apiUrl, price, priceUnit, walletAddress, category } = req.body;

    // Validation
    if (!name || !description || !apiUrl || !price || !walletAddress) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, description, apiUrl, price, walletAddress' 
      });
    }

    const tool = await prisma.registeredTool.create({
      data: {
        name,
        description,
        apiUrl,
        price,
        priceUnit: priceUnit || 'STX',
        walletAddress,
        category: category || 'general',
        status: 'pending'
      }
    });

    res.status(201).json(tool);
  } catch (error) {
    console.error('Error registering tool:', error);
    res.status(500).json({ error: 'Failed to register tool' });
  }
});

// Update tool status (for admin)
app.patch('/api/tools/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const tool = await prisma.registeredTool.update({
      where: { id: req.params.id },
      data: { status }
    });

    res.json(tool);
  } catch (error) {
    console.error('Error updating tool status:', error);
    res.status(500).json({ error: 'Failed to update tool status' });
  }
});

// Log tool call
app.post('/api/tools/call-log', async (req, res) => {
  try {
    const { toolId, userId, txId, amount, status } = req.body;

    const log = await prisma.toolCall.create({
      data: {
        toolId,
        userId,
        txId,
        amount,
        status
      }
    });

    res.status(201).json(log);
  } catch (error) {
    console.error('Error logging tool call:', error);
    res.status(500).json({ error: 'Failed to log tool call' });
  }
});

// Get tool call statistics
app.get('/api/tools/:id/stats', async (req, res) => {
  try {
    const calls = await prisma.toolCall.findMany({
      where: { toolId: req.params.id }
    });

    const stats = {
      totalCalls: calls.length,
      successfulCalls: calls.filter(c => c.status === 'success').length,
      failedCalls: calls.filter(c => c.status === 'failed').length,
      totalRevenue: calls
        .filter(c => c.status === 'success')
        .reduce((sum, c) => sum + parseFloat(c.amount), 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 x402-stacks MCP Registry API running on http://localhost:${PORT}`);
  console.log(`📊 Database connected`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
