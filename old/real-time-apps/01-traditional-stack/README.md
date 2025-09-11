# Traditional Stack: Live Task Board

A real-time collaborative task management application built with Node.js, Express, PostgreSQL, and Socket.io.

## Architecture

```
Frontend (React + Socket.io Client)
     ↓ HTTP/WebSocket
Backend (Express + Socket.io Server)
     ↓ SQL
Database (PostgreSQL)
```

## Tech Stack

- **Backend**: Node.js 18+, Express.js, Socket.io
- **Database**: PostgreSQL 14+
- **Authentication**: JWT tokens + bcrypt
- **Frontend**: React 18, Vite, Socket.io Client
- **Real-time**: Socket.io for bidirectional communication

## Features

✅ **Real-time task management**
- Create, edit, delete tasks with live updates
- Drag & drop between columns (Todo → In Progress → Done)
- See other users' changes instantly

✅ **User authentication**  
- Register/login with username and password
- JWT token-based sessions
- Protected routes and API endpoints

✅ **Multi-user collaboration**
- Multiple users can work on the same board
- Live cursors and user presence indicators
- Conflict resolution for simultaneous edits

## Project Structure

```
01-traditional-stack/
├── backend/                          # Node.js Express server
│   ├── server.js                     # Main server file
│   ├── database/
│   │   ├── connection.js             # PostgreSQL connection pool
│   │   ├── migrations/               # Database schema migrations
│   │   │   ├── 001_users.sql
│   │   │   └── 002_tasks.sql
│   │   └── db.js                     # Database query methods
│   ├── middleware/
│   │   ├── auth.js                   # JWT authentication middleware
│   │   └── cors.js                   # CORS configuration
│   ├── routes/
│   │   ├── auth.js                   # Authentication routes
│   │   └── tasks.js                  # Task CRUD routes
│   ├── socket/
│   │   ├── handlers/                 # Socket.io event handlers
│   │   │   ├── connection.js         # Connection/disconnection
│   │   │   ├── tasks.js              # Task-related events
│   │   │   └── presence.js           # User presence tracking
│   │   └── middleware.js             # Socket.io authentication
│   └── utils/
│       ├── jwt.js                    # JWT token utilities
│       └── validation.js             # Input validation
├── frontend/                         # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── TaskBoard/
│   │   │   │   ├── TaskBoard.jsx     # Main board component
│   │   │   │   ├── TaskColumn.jsx    # Column component
│   │   │   │   ├── TaskCard.jsx      # Individual task card
│   │   │   │   └── TaskForm.jsx      # Create/edit task form
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx         # Login form
│   │   │   │   └── Register.jsx      # Registration form
│   │   │   └── Layout/
│   │   │       ├── Header.jsx        # App header with user info
│   │   │       └── Layout.jsx        # Main layout wrapper
│   │   ├── hooks/
│   │   │   ├── useSocket.js          # Socket.io connection hook
│   │   │   ├── useAuth.js            # Authentication state hook
│   │   │   └── useTasks.js           # Task state management hook
│   │   ├── services/
│   │   │   ├── api.js                # HTTP API calls
│   │   │   ├── socket.js             # Socket.io client setup
│   │   │   └── auth.js               # Authentication service
│   │   ├── utils/
│   │   │   ├── constants.js          # App constants
│   │   │   └── helpers.js            # Utility functions
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Authentication context
│   │   │   └── SocketContext.jsx     # Socket.io context
│   │   ├── App.jsx                   # Main app component
│   │   └── main.jsx                  # Vite entry point
│   ├── package.json
│   └── vite.config.js
├── package.json                      # Backend dependencies
└── .env.example                      # Environment variables template
```

## Setup Instructions

### Prerequisites

1. **Node.js 18+**: Download from [nodejs.org](https://nodejs.org/)
2. **PostgreSQL 14+**: Install locally or use a cloud provider
3. **Git**: For cloning the repository

### Installation

1. **Clone and navigate**:
   ```bash
   cd 01-traditional-stack
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Database setup**:
   ```bash
   # Create PostgreSQL database
   createdb live_task_board
   
   # Run migrations
   npm run migrate
   ```

5. **Environment configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and JWT secret
   ```

### Development

1. **Start backend server** (Terminal 1):
   ```bash
   npm run dev:backend
   ```

2. **Start frontend server** (Terminal 2):
   ```bash
   npm run dev:frontend
   ```

3. **Open your browser**:
   Navigate to `http://localhost:5173`

## Environment Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/live_task_board

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Socket.io Events

### Client → Server
- `join_board` - Join a task board room
- `create_task` - Create new task
- `update_task` - Update existing task
- `delete_task` - Delete task
- `user_typing` - User typing indicator

### Server → Client
- `task_created` - New task created by another user
- `task_updated` - Task updated by another user  
- `task_deleted` - Task deleted by another user
- `user_joined` - User joined the board
- `user_left` - User left the board
- `user_typing` - Another user is typing

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tasks Table  
```sql
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'todo',
    position INTEGER DEFAULT 0,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Complexity Analysis

### Lines of Code
- **Backend**: ~800 lines
- **Frontend**: ~600 lines  
- **Configuration**: ~50 lines
- **Total**: ~1,450 lines

### Key Complexity Points

1. **Socket.io Setup**: Manual event handling, room management, authentication
2. **Database Management**: Connection pooling, migrations, raw SQL queries
3. **Authentication**: JWT token generation, bcrypt hashing, middleware
4. **State Synchronization**: Manual conflict resolution, optimistic updates
5. **Error Handling**: Try/catch blocks, connection recovery, validation
6. **Development Setup**: Multiple servers, database installation, environment config

### Production Deployment

**Requirements:**
- VPS or cloud server (AWS, DigitalOcean, etc.)
- PostgreSQL database setup
- Reverse proxy (nginx)
- SSL certificates
- Environment configuration
- Monitoring and logging

**Estimated deployment time**: 2-4 hours

**Monthly costs**: $50-150+ (server + database + monitoring)

## Common Issues & Solutions

1. **Database connection errors**: Check PostgreSQL is running and credentials are correct
2. **CORS issues**: Verify `CORS_ORIGIN` matches frontend URL
3. **Socket.io connection failures**: Check firewall settings and proxy configuration
4. **JWT token issues**: Ensure `JWT_SECRET` is set and consistent

This implementation showcases the traditional approach to building real-time web applications, highlighting the complexity and manual setup required for production-ready real-time features.