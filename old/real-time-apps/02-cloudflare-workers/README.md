# Cloudflare Workers: Live Task Board

A real-time collaborative task management application built with Cloudflare Workers, D1 Database, and Durable Objects for WebSocket connections.

## Architecture

```
Frontend (React + WebSocket API)
     ↓ HTTP/WebSocket
Cloudflare Workers + Durable Objects
     ↓ SQL
D1 Database (SQLite at the edge)
```

## Tech Stack

- **Runtime**: Cloudflare Workers (V8 isolates)
- **Database**: Cloudflare D1 (SQLite)
- **Real-time**: WebSocket API + Durable Objects
- **Authentication**: Web Crypto API + JWT
- **Frontend**: React 18, Vite
- **Deployment**: Wrangler CLI

## Features

✅ **Edge-native real-time**
- WebSocket connections handled by Durable Objects
- Global distribution with sub-100ms latency
- Automatic scaling with zero cold starts

✅ **Serverless authentication**
- JWT tokens with Web Crypto API
- Password hashing with SubtleCrypto
- Session management via Durable Objects

✅ **Global SQLite database**
- D1 provides SQLite at the edge
- Automatic replication and backups
- SQL queries with prepared statements

## Project Structure

```
02-cloudflare-workers/
├── worker/                           # Cloudflare Worker
│   ├── src/
│   │   ├── index.ts                  # Main worker entry point
│   │   ├── router.ts                 # Request routing logic
│   │   ├── auth.ts                   # Authentication utilities
│   │   ├── database.ts               # D1 database methods
│   │   ├── websocket.ts              # WebSocket handling
│   │   └── durable-objects/
│   │       ├── TaskBoardDurableObject.ts  # Real-time task management
│   │       └── SessionDurableObject.ts    # User session storage
│   ├── migrations/
│   │   ├── 0001_initial.sql          # User and credential tables
│   │   └── 0002_tasks.sql            # Task table
│   ├── wrangler.toml                 # Cloudflare configuration
│   └── package.json
├── frontend/                         # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskBoard/
│   │   │   │   ├── TaskBoard.jsx
│   │   │   │   ├── TaskColumn.jsx
│   │   │   │   ├── TaskCard.jsx
│   │   │   │   └── TaskForm.jsx
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   └── Layout/
│   │   │       ├── Header.jsx
│   │   │       └── Layout.jsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js       # WebSocket connection hook
│   │   │   ├── useAuth.js            # Authentication state
│   │   │   └── useTasks.js           # Task management
│   │   ├── services/
│   │   │   ├── api.js                # HTTP API calls to worker
│   │   │   ├── websocket.js          # WebSocket client
│   │   │   └── auth.js               # Authentication service
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── package.json                      # Root package.json for scripts
```

## Setup Instructions

### Prerequisites

1. **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
2. **Cloudflare Account**: Free tier includes generous limits
3. **Wrangler CLI**: Installed globally via npm

### Installation

1. **Install Wrangler globally**:
   ```bash
   npm install -g wrangler
   ```

2. **Install dependencies**:
   ```bash
   cd 02-cloudflare-workers
   npm install
   cd worker && npm install && cd ..
   cd frontend && npm install && cd ..
   ```

3. **Authenticate with Cloudflare**:
   ```bash
   cd worker
   wrangler auth login
   ```

4. **Create D1 database**:
   ```bash
   wrangler d1 create live-task-board
   # Copy the database ID to wrangler.toml
   ```

5. **Run database migrations**:
   ```bash
   wrangler d1 migrations apply live-task-board --local
   wrangler d1 migrations apply live-task-board --remote
   ```

### Development

1. **Start worker dev server** (Terminal 1):
   ```bash
   cd worker
   wrangler dev
   ```

2. **Start frontend dev server** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open your browser**:
   Navigate to `http://localhost:5173`

## Cloudflare Configuration

### wrangler.toml
```toml
name = "live-task-board-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
vars = { ENVIRONMENT = "production" }

[[env.production.d1_databases]]
binding = "DB"
database_name = "live-task-board"
database_id = "your-database-id-here"

[[durable_objects.bindings]]
name = "TASK_BOARD"
class_name = "TaskBoardDurableObject"

[[durable_objects.bindings]]
name = "SESSIONS"
class_name = "SessionDurableObject"

[build]
command = "npm run build"
```

## Real-time Implementation

### Durable Objects for WebSockets

```typescript
// TaskBoardDurableObject.ts
export class TaskBoardDurableObject implements DurableObject {
  private sessions = new Map<WebSocket, UserSession>();

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") === "websocket") {
      return this.handleWebSocket(request);
    }
    return new Response("Not found", { status: 404 });
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const [client, server] = Object.values(new WebSocketPair());
    
    server.accept();
    
    server.addEventListener("message", async (event) => {
      const data = JSON.parse(event.data);
      await this.handleMessage(server, data);
    });

    return new Response(null, { status: 101, webSocket: client });
  }
}
```

### Authentication with Web Crypto

```typescript
// auth.ts
import { SignJWT, jwtVerify } from 'jose';

export async function createJWT(payload: object): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);
  
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + SALT);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
```

## Database Operations

### D1 Prepared Statements

```typescript
// database.ts
export class Database {
  constructor(private db: D1Database) {}

  async createTask(userId: string, title: string, description: string): Promise<Task> {
    const result = await this.db.prepare(`
      INSERT INTO tasks (id, title, description, user_id, created_at)
      VALUES (?1, ?2, ?3, ?4, ?5)
    `)
    .bind(crypto.randomUUID(), title, description, userId, new Date().toISOString())
    .run();

    return this.getTaskById(result.meta.last_row_id);
  }
}
```

## Deployment

### Local Development
```bash
wrangler dev --local --persist
```

### Production Deployment
```bash
# Deploy worker
wrangler deploy

# Deploy frontend to Cloudflare Pages (optional)
cd frontend && npm run build
wrangler pages publish dist
```

## Complexity Analysis

### Lines of Code
- **Worker**: ~600 lines
- **Frontend**: ~500 lines  
- **Configuration**: ~100 lines
- **Total**: ~1,200 lines

### Key Complexity Points

1. **Durable Objects Setup**: Manual WebSocket lifecycle management
2. **Custom Protocol**: Designing message format and event handling
3. **Authentication**: Web Crypto API implementation vs libraries
4. **Database**: D1 prepared statements and migration management
5. **Development Setup**: Multiple wrangler commands, D1 local/remote sync

### Production Benefits

**Global Performance:**
- 200+ edge locations worldwide
- Sub-100ms latency globally
- Automatic scaling with zero cold starts

**Cost Efficiency:**
- Pay per request (no idle costs)
- Generous free tier (100K requests/day)
- No server management

**Reliability:**
- Built on Cloudflare's global network
- Automatic failover and redundancy
- 99.99%+ uptime SLA

This implementation demonstrates Cloudflare Workers' power for real-time applications while showcasing the complexity involved in manual WebSocket and Durable Object management.