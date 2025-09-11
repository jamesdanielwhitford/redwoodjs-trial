# RedwoodSDK Version - 5 Minute Setup

## What This Demonstrates

This version shows RedwoodSDK's "Zero Magic" philosophy - **composability over configuration**. The same note-taking app from previous versions, but with:

- **Zero configuration setup** (1 config file vs 9)
- **Built-in authentication** (no manual JWT)
- **Server Components by default** (better performance)  
- **File-based routing** (no manual routing code)

## Quick Start (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Run database migrations (auto-generated)
npm run db:migrate

# 3. Start development server
npm run dev
```

That's it! Visit `http://localhost:3000`

## Key Differences vs Previous Versions

### Configuration Complexity
- **Traditional**: 9 config files, 3 processes, PostgreSQL setup
- **Workers**: 6 config files, 2 processes, manual routing code  
- **RedwoodSDK**: 1 config file, 1 process, zero manual setup

### Authentication
- **Traditional**: Manual JWT + bcrypt (~150 lines)
- **Workers**: Web Crypto API complexity (~150 lines)
- **RedwoodSDK**: Built-in auth helpers (~20 lines)

### Routing
- **Traditional**: Client-side routing with manual state
- **Workers**: Manual Worker routing (~400 lines)
- **RedwoodSDK**: File-based routing (zero code)

### Data Fetching
- **Traditional**: Client-side with loading states
- **Workers**: Client-side with API integration
- **RedwoodSDK**: Server Components (pre-loaded data)

## Architecture Benefits

### Server Components
- Pages render on server by default
- No loading states needed
- Better performance and SEO

### Selective Client Interactivity  
- Use `'use client'` directive only where needed
- Forms and interactive elements are client components
- Server handles data fetching and authentication

### Zero Configuration
- Database schema auto-generated
- Authentication built-in
- Routing handled by file structure
- CORS automatically configured

## File Structure
```
src/
  routes/           # File-based routing
    index.tsx       # Home page (auto-redirects)  
    login.tsx       # Login page
    dashboard.tsx   # Dashboard page
    api/            # API routes
      login.ts      # Login endpoint
      logout.ts     # Logout endpoint
      notes/        # Notes CRUD API
  components/       # React components
    LoginForm.tsx   # Client component
    AddNoteForm.tsx # Client component  
    NotesList.tsx   # Server component
    DeleteNoteButton.tsx # Client component
  lib/              # Framework utilities
    auth.ts         # Built-in auth helpers
    db.ts           # Database connection
```

## The RedwoodSDK Value Proposition

**Setup Time**: 5 minutes (vs 45 min traditional, 20 min Workers)  
**Config Files**: 1 (vs 9 traditional, 6 Workers)
**Manual Code**: Minimal (vs 500+ lines traditional, 400+ Workers)
**Developer Experience**: Exceptional - focus on features, not infrastructure