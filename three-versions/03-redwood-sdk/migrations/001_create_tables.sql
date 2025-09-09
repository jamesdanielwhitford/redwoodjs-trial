-- RedwoodSDK Database Schema
-- Automatically applied by RedwoodSDK migration system
-- No manual wrangler d1 commands needed!

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Sample data automatically seeded by RedwoodSDK
INSERT OR IGNORE INTO users (email, password_hash) VALUES 
('test@example.com', 'password123_hash_automatically_generated');

INSERT OR IGNORE INTO notes (user_id, title, content) VALUES 
(1, 'Welcome to RedwoodSDK!', 'This note was created automatically during setup. Notice how simple the database configuration is - no manual D1 setup required!'),
(1, 'Zero Configuration Magic', 'RedwoodSDK automatically configured:
• D1 database and tables
• Authentication system  
• API routing
• React Server Components
• Global deployment

All without any manual configuration!'),
(1, 'Framework Benefits', 'Compare this setup to Version 1 (Traditional) and Version 2 (Workers):
• No PostgreSQL installation
• No Wrangler configuration
• No manual JWT implementation
• No routing boilerplate
• Just pure business logic!');

-- Indexes automatically optimized by RedwoodSDK
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);