# Manual Setup Steps for Traditional Stack Version

## ⚠️ IMPORTANT: Required Setup Before Running

This demonstrates **why traditional stack development is complex**. You'll need to complete these manual steps to run the Simple Note Taker app.

## Step 1: Install PostgreSQL

### Option A: Local PostgreSQL (Recommended)

#### macOS (using Homebrew):
```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb simple_notes

# Test connection
psql simple_notes -c "SELECT version();"
```

#### Windows:
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings (remember the password!)
3. Open Command Prompt:
```cmd
createdb simple_notes
psql simple_notes -c "SELECT version();"
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb simple_notes
sudo -u postgres psql simple_notes -c "SELECT version();"
```

### Option B: Cloud PostgreSQL (Alternative)
- **Supabase**: https://supabase.com (free tier)
- **Aiven**: https://aiven.io (free trial)  
- **Railway**: https://railway.app (free tier)

## Step 2: Configure Environment Variables

1. **Navigate to backend directory:**
   ```bash
   cd three-versions/01-traditional-stack/backend
   ```

2. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env file** with your database details:
   ```env
   # Local PostgreSQL (adjust username as needed)
   DATABASE_URL=postgresql://your_username@localhost:5432/simple_notes
   
   # Cloud PostgreSQL (use your connection string)
   # DATABASE_URL=postgresql://user:password@host:5432/database
   
   # Generate a secure JWT secret (required!)
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long
   
   # Server settings (usually don't need to change)
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

## Step 3: Generate JWT Secret

**Required for authentication to work!**

Choose one method:
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL  
openssl rand -hex 32

# Option 3: Online generator
# Visit: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx
```

Copy the generated string to your `.env` file's `JWT_SECRET` field.

## Step 4: Test Database Connection

```bash
# Make sure you're in the backend directory
cd three-versions/01-traditional-stack/backend

# Install dependencies
npm install

# Test database connection
npm run test-db
```

**If this fails, fix the DATABASE_URL before continuing.**

## Step 5: Set Up Database Schema

```bash
# Create database tables
npm run migrate

# Add test data
npm run seed
```

This creates:
- `users` table with test user: `test@example.com` / `password123`
- `notes` table with 3 sample notes

## Step 6: Start the Backend Server

```bash
# Start Express server (keep this terminal open!)
npm run dev
```

You should see:
```
🚀 Simple Notes Backend running on port 5000
📊 Health check: http://localhost:5000/health
🔐 API endpoints: http://localhost:5000/api
```

## Step 7: Start the Frontend

**Open a NEW terminal window:**

```bash
# Navigate to frontend directory
cd three-versions/01-traditional-stack/frontend

# Install dependencies
npm install

# Start React development server
npm run dev
```

You should see:
```
Local:   http://localhost:3000/
```

## Step 8: Test the Application

1. **Open browser**: http://localhost:3000
2. **Login with test credentials**:
   - Email: `test@example.com`
   - Password: `password123`
3. **Test functionality**:
   - View existing notes
   - Create new notes
   - Delete notes
   - Logout and login again

## What You Just Experienced: Traditional Stack Complexity

### **Setup Time**: ~45 minutes
- PostgreSQL installation: 15-20 minutes
- Environment configuration: 10 minutes
- Database setup: 10 minutes
- Dependencies and testing: 10 minutes

### **Configuration Files Created**: 8+
```
backend/
├── package.json        # Node.js dependencies
├── tsconfig.json       # TypeScript settings
├── .env               # Environment variables
└── migrations/        # Database schema

frontend/
├── package.json       # React dependencies  
├── tsconfig.json      # TypeScript settings
├── vite.config.ts     # Dev server config
├── tailwind.config.js # CSS framework
└── postcss.config.js  # CSS processing
```

### **Running Processes**: 3
1. **PostgreSQL** (port 5432) - Database server
2. **Express Backend** (port 5000) - API server  
3. **React Frontend** (port 3000) - Development server

### **Points of Failure**:
- PostgreSQL not running → Backend fails
- Wrong DATABASE_URL → Connection errors
- Missing JWT_SECRET → Auth fails
- Backend not running → Frontend API calls fail
- Port conflicts → Services don't start

## Ready for the Comparison!

Now that you've experienced traditional stack complexity, you're ready to appreciate:

- **Version 2** (Cloudflare Workers): Eliminates PostgreSQL setup, reduces configuration
- **Version 3** (RedwoodSDK): One command setup, zero configuration

The contrast will be dramatic! 🚀

## Troubleshooting

### Common Issues:

**"Database connection failed"**
```bash
# Check PostgreSQL is running
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql       # Linux

# Test manual connection
psql simple_notes
```

**"Port 3000/5000 already in use"**
```bash
# Find what's using the port
lsof -i :3000
lsof -i :5000

# Kill the process or change port in .env
```

**"JWT_SECRET not set"**
- Make sure `.env` file exists in backend directory
- Generate a JWT secret as shown in Step 3

**"CORS errors in browser"**
- Make sure backend is running on port 5000
- Check FRONTEND_URL in backend `.env` file