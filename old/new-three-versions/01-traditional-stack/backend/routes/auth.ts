import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { database } from '../database/db';
import { generateToken } from '../middleware/auth';
import { CreateUserRequest, LoginRequest, AuthResponse } from '../types';

const router = express.Router();

// Register endpoint
router.post('/register', async (req: Request<{}, AuthResponse, CreateUserRequest>, res: Response<AuthResponse>) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' } as any);
      return;
    }

    // Check if user already exists
    const existingUser = await database.findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' } as any);
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await database.createUser(email, passwordHash);
    
    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' } as any);
  }
});

// Login endpoint  
router.post('/login', async (req: Request<{}, AuthResponse, LoginRequest>, res: Response<AuthResponse>) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' } as any);
      return;
    }

    // Find user
    const user = await database.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' } as any);
      return;
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' } as any);
      return;
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' } as any);
  }
});

export default router;