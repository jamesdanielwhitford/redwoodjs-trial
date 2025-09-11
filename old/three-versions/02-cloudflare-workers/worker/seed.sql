-- Seed data for Simple Note Taker D1 database
-- Test user with hashed password for "password123" 

-- Insert test user (password: password123)
-- Note: This is a pre-computed hash using Web Crypto API SHA-256
INSERT OR IGNORE INTO users (email, password_hash) VALUES 
('test@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f');

-- Insert sample notes for the test user
INSERT OR IGNORE INTO notes (user_id, title, content) VALUES 
(1, 'Welcome to Simple Notes!', 'This is your first note. You can create, view, and delete notes using this simple app built with Cloudflare Workers and D1 database.'),
(1, 'Cloudflare Workers Benefits', 'Notice the improvements over traditional stack:
• No PostgreSQL setup required
• Serverless scaling
• Global edge deployment
• Only 2 processes instead of 3

But still requires manual Worker code and Wrangler configuration - RedwoodSDK will solve this!'),
(1, 'Edge Computing', 'This app runs on Cloudflare''s edge network, providing low latency worldwide. Your data is stored in D1, a SQLite database optimized for edge computing.');