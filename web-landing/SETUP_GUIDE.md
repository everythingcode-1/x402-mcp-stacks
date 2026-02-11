# x402-stacks MCP Landing Page - Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Prisma.io or local)
- npm or yarn package manager

## Installation Steps

### 1. Navigate to web-landing directory

```bash
cd web-landing
```

### 2. Install dependencies

```bash
npm install
```

This will install:
- React + Vite for frontend
- Prisma for database ORM
- Express for backend API
- All UI components (Radix UI, Framer Motion, Lucide icons)

### 3. Setup Environment Variables

Copy the example environment file:

```bash
cp env.example .env
```

Edit `.env` and configure your database:

```env
DATABASE_URL="postgres://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require&pool=true"
API_PORT=3100
```

**Your database connection string:**
```
postgres://79aa8ed40c97ca8cdaa1f0e82379060a9bbb6ea4f38841ce759a1d77f540dc0c:sk_NBXDqUPE6tyqaD_cD5pje@db.prisma.io:5432/postgres?sslmode=require&pool=true
```

### 4. Initialize Database

Generate Prisma client:

```bash
npm run db:generate
```

Push schema to database:

```bash
npm run db:push
```

This creates two tables:
- `registered_tools` - Stores x402 tool registrations
- `tool_calls` - Logs tool usage and payments

### 5. Start Development Servers

You need to run TWO servers:

**Terminal 1 - Frontend (Vite):**
```bash
npm run dev
```
Runs on: http://localhost:5173

**Terminal 2 - Backend API:**
```bash
npm run api
```
Runs on: http://localhost:3100

## Project Structure

```
web-landing/
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx       # Main landing page
│   │   ├── RegisterTool.tsx      # Tool registration form
│   │   ├── ToolsListing.tsx      # Browse registered tools
│   │   └── DocumentationComplete.tsx
│   ├── components/               # UI components
│   └── App.tsx                   # Routes
├── server/
│   └── index.ts                  # Express API server
├── prisma/
│   └── schema.prisma             # Database schema
└── package.json
```

## API Endpoints

### GET /api/health
Health check endpoint

### GET /api/tools
Get all approved tools

### GET /api/tools/:id
Get single tool by ID

### POST /api/tools/register
Register a new tool

Request body:
```json
{
  "name": "Weather API",
  "description": "Real-time weather data",
  "apiUrl": "https://api.example.com",
  "price": "1000",
  "priceUnit": "STX",
  "walletAddress": "ST1ABC...",
  "category": "data"
}
```

### PATCH /api/tools/:id/status
Update tool status (pending/approved/rejected)

### POST /api/tools/call-log
Log tool usage

### GET /api/tools/:id/stats
Get tool statistics

## Database Schema

### registered_tools
- `id` - UUID primary key
- `name` - Tool name
- `description` - Tool description
- `apiUrl` - API endpoint URL
- `price` - Price in microSTX
- `priceUnit` - Currency (STX, sBTC, USDCx)
- `walletAddress` - Payment recipient address
- `category` - Tool category
- `status` - pending/approved/rejected
- `createdAt` - Registration timestamp
- `updatedAt` - Last update timestamp

### tool_calls
- `id` - UUID primary key
- `toolId` - Reference to tool
- `userId` - User/agent identifier
- `txId` - Stacks transaction ID
- `amount` - Payment amount
- `status` - success/failed
- `createdAt` - Call timestamp

## Usage Flow

### For Tool Providers

1. Visit http://localhost:5173
2. Click "Register Your Tool"
3. Fill in tool details:
   - Name and description
   - API URL (must implement x402-stacks)
   - Price per call (in microSTX)
   - Payment wallet address
   - Category
4. Submit for approval
5. Tool appears in listings once approved

### For AI Agents (via MCP)

Tools registered here are automatically available to the x402-stacks MCP server when it reads from the database. AI agents can:

1. Discover tools via MCP
2. Call tools automatically
3. Pay with STX when receiving 402
4. Get data without human intervention

## Integrating with MCP Server

Update your MCP server to read tools from database:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Load tools from database
const tools = await prisma.registeredTool.findMany({
  where: { status: 'approved' }
});

// Register each tool as MCP tool
tools.forEach(tool => {
  server.setRequestHandler(/* ... */);
});
```

## Development Tips

### View Database
```bash
npm run db:studio
```
Opens Prisma Studio at http://localhost:5555

### Hot Reload
Both frontend and backend support hot reload:
- Frontend: Vite auto-reloads
- Backend: tsx watch mode

### CORS Issues
Backend API has CORS enabled for localhost:5173. Update if needed in `server/index.ts`.

## Production Deployment

### Frontend (Vite)
```bash
npm run build
```
Outputs to `dist/` directory

### Backend API
Deploy to any Node.js hosting:
- Heroku
- Railway
- Render
- Vercel (serverless)

### Database
Use production PostgreSQL:
- Supabase
- Railway
- Neon
- Prisma.io (as you're using)

## Troubleshooting

### Database connection fails
- Check DATABASE_URL in .env
- Ensure database is accessible
- Run `npm run db:push` again

### API not responding
- Check if port 3100 is available
- Ensure backend server is running
- Check console for errors

### Frontend not loading
- Clear browser cache
- Check if Vite dev server is running on 5173
- Check browser console for errors

### Tools not appearing
- Check tool status in database (must be "approved")
- Verify API is returning data
- Check network tab in browser dev tools

## Next Steps

1. Register demo tools for testing
2. Integrate with main MCP server
3. Test full payment flow
4. Deploy to production

## Support

For issues or questions:
- Check main project README
- Review x402-stacks documentation
- Check Prisma documentation for database issues
