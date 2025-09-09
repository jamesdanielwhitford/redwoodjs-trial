# Version 1: Traditional Stack (React + Express + PostgreSQL)

## Overview

This is a **minimal "Simple Note Taker"** app built with the traditional full-stack approach. The app demonstrates the complexity and setup requirements of building even basic functionality without modern serverless frameworks.

**The Goal**: Show why traditional development is complex so you can appreciate what Cloudflare Workers and RedwoodSDK solve.

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript + Basic Tailwind CSS
- **Backend**: Node.js + Express + Basic JWT
- **Database**: PostgreSQL
- **Authentication**: Simple email/password with JWT tokens

## App Features (Intentionally Minimal)

- **User Login**: Email/password authentication
- **Notes List**: View all user's notes
- **Create Note**: Simple form (title + content)
- **Delete Note**: Remove notes with confirmation

**That's it!** Just 4 basic features to demonstrate CRUD + Auth complexity.

## Traditional Stack Pain Points Demonstrated

### 1. **Infrastructure Setup Complexity** (30-45 minutes)
- Install and configure PostgreSQL database
- Create database and manage connection strings
- Set up environment variables across multiple files
- Database migration management

### 2. **Development Workflow Complexity**
- **3 separate processes**: PostgreSQL + Express backend + React frontend
- **Multiple terminal windows** required
- **Port management**: Database (5432) + Backend (5000) + Frontend (3000)
- **CORS configuration** for cross-origin requests

### 3. **Configuration File Overhead** (8+ config files)
```
backend/
├── package.json (dependencies)
├── tsconfig.json (TypeScript config)
├── .env (database URL, JWT secret)
└── migrations/ (SQL files)

frontend/  
├── package.json (different dependencies)
├── tsconfig.json (different TS config)
├── vite.config.ts (dev server config)
├── tailwind.config.js (styling)
└── postcss.config.js (CSS processing)
```

### 4. **Authentication Boilerplate**
- Manual JWT token generation and validation
- Password hashing with bcrypt
- Route protection middleware
- Token storage and management on frontend
- Manual CORS and security headers

### 5. **Database Management**
- SQL schema design and migrations
- Connection pool management
- Manual query writing
- Database relationship setup

## Quick Start

⚠️ **IMPORTANT**: Complete the setup steps in MANUAL_STEPS.md first!

```bash
# 1. Set up PostgreSQL database (see MANUAL_STEPS.md)
# 2. Configure .env file with database URL and JWT secret

# Install backend
cd backend
npm install
npm run migrate  # Create database tables
npm run seed     # Add test data
npm run dev      # Start on port 5000

# Install frontend (in new terminal)
cd ../frontend  
npm install
npm run dev      # Start on port 3000
```

## What You'll Experience

### **Time to First Run**: ~45 minutes
Including:
- PostgreSQL setup and configuration
- Environment variable configuration  
- Database migrations
- Installing dependencies for both projects
- Getting both servers running simultaneously

### **Pain Points You'll Feel**:
1. **Database Setup**: Installing PostgreSQL, creating databases, connection strings
2. **Multiple Terminals**: Need 2-3 terminal windows open constantly  
3. **Configuration Hell**: 8+ config files to manage
4. **Port Juggling**: Making sure nothing conflicts with 3000, 5000, 5432
5. **CORS Issues**: Frontend/backend communication problems
6. **State Management**: Manual loading states, error handling throughout

## The Comparison Promise

After struggling through this traditional approach, you'll build the **exact same Simple Note Taker app** using:

- **Version 2** (Cloudflare Workers + Wrangler): Eliminates server/database setup
- **Version 3** (RedwoodSDK): Eliminates almost all configuration

Each version will have **identical functionality** but dramatically different developer experiences.

## Test Login

After seeding the database:
- **Email**: `test@example.com`  
- **Password**: `password123`

## Project Structure

```
01-traditional-stack/
├── README.md
├── MANUAL_STEPS.md        # Required PostgreSQL setup
├── COMPARISON_NOTES.md    # Pain points tracking
├── backend/               # Express API server
│   ├── package.json
│   ├── .env.example
│   ├── src/server.ts     # Main server file
│   ├── src/auth.ts       # JWT authentication
│   └── migrations/       # Database schema
└── frontend/             # React app
    ├── package.json
    ├── vite.config.ts
    ├── src/App.tsx
    ├── src/Login.tsx     # Login page
    ├── src/Dashboard.tsx # Notes list + add form
    └── src/api.ts       # Backend communication
```

**Next**: After experiencing this complexity, move to Version 2 (Cloudflare Workers) to see how serverless eliminates most of these pain points.