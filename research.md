# RedwoodSDK Research Findings

## What is RedwoodSDK?

RedwoodSDK is a React framework specifically designed for Cloudflare's serverless platform. It positions itself as a "framework that's not a framework" - more accurately described as a toolkit or SDK that provides minimal abstraction while enabling powerful full-stack development.

### Core Identity
- **React framework for Cloudflare**: Built from the ground up for Cloudflare Workers
- **Starts as a Vite plugin**: Enables server-side rendering, React Server Components, and real-time capabilities  
- **Standards-based router**: Provides fine-grained control over requests and responses with middleware support
- **Project creation**: `npx create-rwsdk my-project-name`

### Three Design Principles

1. **Zero Magic**
   - No code generation or transpilation side effects
   - No special treatment of file names or exports
   - "What you write is what runs"
   - Everything respects JavaScript's core contracts

2. **Composability Over Configuration**  
   - Provides primitives, not rigid policies
   - No opinionated wrappers or folder structures
   - Encourages co-location of logic, UI, and infrastructure
   - Developer intent takes priority

3. **Web-First Architecture**
   - Uses native Web APIs (fetch, Request, Response, URL)
   - No abstraction over browser primitives
   - "If the platform already gives you a tool, we do not wrap it"

## Relationship to Cloudflare Workers & Wrangler

### Cloudflare Workers
Cloudflare Workers is a serverless edge computing platform that provides:
- Global deployment across Cloudflare's network
- Multiple language support (JavaScript, TypeScript, Python, Rust)
- No infrastructure management required
- Built-in observability and monitoring
- Integration with Cloudflare services (D1, R2, Queues, etc.)

### Wrangler CLI
Wrangler is Cloudflare's command-line interface for managing Worker projects:
- Creates, develops, and deploys Cloudflare Workers
- Handles project configurations and bundling
- Manages different deployment environments
- Provides standardized workflow for Worker development

### RedwoodSDK's Integration
RedwoodSDK builds on top of this foundation by:
- **Local Development**: Uses Miniflare to accurately emulate Cloudflare Workers runtime
- **Built-in Services**: Zero configuration access to D1, R2, Durable Objects, Queues, Workers AI
- **Deployment**: Simple `npm run release` command (built on Wrangler)
- **React Integration**: Seamless server/client code splitting with React Server Components

## Value Proposition Analysis

### Problems RedwoodSDK Solves

#### vs Traditional Full-Stack Development
Traditional stack issues RedwoodSDK addresses:
- **Server Management**: Eliminates need for server provisioning, scaling, maintenance
- **Global Performance**: Edge computing provides low-latency worldwide
- **Infrastructure Complexity**: Built-in database, storage, queues without separate services
- **Development/Production Parity**: Local development mirrors production exactly

#### vs Raw Cloudflare Workers + Wrangler
Raw Workers/Wrangler challenges RedwoodSDK solves:
- **Framework Benefits**: Brings React ecosystem to serverless edge computing
- **Standardized Patterns**: Provides established routing, middleware, and request handling patterns
- **Reduced Boilerplate**: Eliminates repetitive Worker setup and configuration code
- **React Server Components**: First-class server/client component architecture
- **Developer Experience**: Familiar React development patterns in serverless environment

### Key Differentiators

1. **React-First Serverless**: Purpose-built for React on Cloudflare, not adapted
2. **Minimal Abstraction**: "No wrappers. No black boxes. Just flow."
3. **Platform Native**: Uses Web APIs directly rather than creating custom abstractions  
4. **Developer Control**: "Own your software" philosophy with explicit, understandable code
5. **Edge-Native**: Built for edge computing from the first line of code

## Technical Features

### Core Capabilities
- **React Server Components**: Server-first by default, streaming HTML directly to browser
- **Routing**: "Every route is just a function" - can return JSX, stream responses, or upgrade to websockets
- **Middleware & Interrupters**: Fine-grained request flow control
- **Real-time**: Built-in WebSocket and real-time capabilities
- **Background Jobs**: Integration with Cloudflare Queues for background processing

### Development Experience
- **Local Development**: Miniflare provides exact production runtime emulation
- **No Configuration**: Built-in access to all Cloudflare services
- **Standards Compliance**: Uses native Web APIs throughout
- **Composable Architecture**: Build with functions, modules, and types

### Deployment & Hosting
- **One-Command Deploy**: `npm run release` handles entire deployment process
- **Custom Domains**: Easy integration with Cloudflare domain management
- **Global Edge Network**: Automatic distribution across Cloudflare's worldwide infrastructure
- **Integrated Services**: Seamless access to D1 database, R2 storage, and other Cloudflare services

## Implications for Comparative Guide Project

Based on this research, the three-way comparison outlined in `brief.md` will effectively demonstrate:

1. **Traditional Stack Pain Points**: Server management, scaling complexity, geographic latency
2. **Cloudflare Benefits**: Edge computing, serverless scaling, integrated services  
3. **RedwoodSDK Value**: React framework benefits without sacrificing Cloudflare advantages

The comparative approach should reveal how RedwoodSDK bridges the gap between familiar React development patterns and modern serverless edge computing, providing the best of both worlds while maintaining developer control and platform transparency.

### Key Questions for Comparison
- How much setup/configuration is required for each approach?
- What's the development experience like (local dev, debugging, deployment)?
- How does performance compare (latency, scaling, global distribution)?
- What's the learning curve for developers familiar with traditional React development?
- How do the deployment and maintenance workflows differ?

This research provides the foundation for understanding RedwoodSDK's position in the ecosystem and will inform the development of the three comparison guides.