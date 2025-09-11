# Quick Notes - Traditional Stack

A simple note-taking application built with the traditional Node.js + Express + SQLite + React stack.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite
- **Authentication**: JWT + bcrypt

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or pnpm

### Installation Steps

1. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

2. **Setup the database**:
   ```bash
   npm run db:setup
   ```
   This creates the SQLite database and tables.

3. **Start the development servers**:
   ```bash
   npm run dev
   ```
   This starts both the backend (port 3001) and frontend (port 5173) concurrently.

4. **Open your browser**:
   Navigate to `http://localhost:5173`

## What This Demonstrates

### Traditional Stack Pain Points:

#### 1. **Multiple Processes Required**:
- Backend server on port 3001
- Frontend dev server on port 5173
- Database setup as separate step

#### 2. **Manual CORS Configuration** (`backend/server.ts:15-20`):
```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:5173'],
  credentials: true
}));
```

#### 3. **Complex Authentication Implementation**:

**JWT Token Generation** (`backend/middleware/auth.ts:32-34`):
```typescript
export const generateToken = (userId: number): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '24h' });
};
```

**Token Verification Middleware** (`backend/middleware/auth.ts:13-31`):
```typescript
export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const user = await database.findUserById(decoded.userId);
    
    if (!user) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email
    };
    
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};
```

**Password Hashing** (`backend/routes/auth.ts:20-21`):
```typescript
const saltRounds = 12;
const passwordHash = await bcrypt.hash(password, saltRounds);
```

#### 4. **Manual Database Setup**:
- SQLite database file management
- Manual table creation
- Custom database wrapper class (150+ lines)

#### 5. **API Route Configuration**:
Every endpoint requires manual setup:
```typescript
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
```

#### 6. **Client-Side State Management**:
Manual token storage and management in localStorage.

## File Count & Complexity

**Configuration Files**: 5
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.node.json`  
- `backend/tsconfig.json`

**Backend Files**: 8
- `server.ts` (80+ lines)
- `database/db.ts` (150+ lines)
- `middleware/auth.ts` (40+ lines)
- `routes/auth.ts` (80+ lines)
- `routes/notes.ts` (60+ lines)
- `scripts/setup-db.ts` (20+ lines)
- `types/index.ts` (30+ lines)

**Frontend Files**: 8
- `App.tsx`
- `main.tsx`
- `api.ts` (80+ lines)
- `hooks/useAuth.ts` (40+ lines)
- `components/AuthForm.tsx` (80+ lines)
- `components/Dashboard.tsx` (70+ lines)
- `components/NoteForm.tsx` (80+ lines)
- `components/NoteList.tsx` (30+ lines)

**Total Lines of Code**: ~900+ lines
**Setup Time**: 15-20 minutes minimum
**Processes to Run**: 2 (backend + frontend)

## Production Deployment

For production deployment, you would need to:

1. Set up a server (VPS, AWS EC2, etc.)
2. Install Node.js and dependencies
3. Set up environment variables
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure database backups
7. Set up monitoring and logging
8. Configure CI/CD pipeline

**Estimated production setup time**: 2-4 hours for experienced developers.