import express from 'express';
import { userDb } from '../database/db.js';
import { generateToken } from '../utils/jwt.js';
import { authenticateToken, rateLimit } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../utils/validation.js';

const router = express.Router();

// Apply rate limiting to auth routes
const authRateLimit = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 20 // 20 requests per window
});

// Register new user
router.post('/register', authRateLimit, async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateRegistration(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const { username, password } = value;

    // Check if user already exists
    const existingUser = await userDb.findByUsername(username);
    if (existingUser) {
      return res.status(409).json({
        error: 'Username already taken',
        code: 'USERNAME_EXISTS'
      });
    }

    // Create new user
    const user = await userDb.create(username, password);
    
    // Generate JWT token
    const token = generateToken({ 
      userId: user.id, 
      username: user.username 
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      code: 'REGISTRATION_ERROR'
    });
  }
});

// Login user
router.post('/login', authRateLimit, async (req, res) => {
  try {
    // Validate input
    const { error, value } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const { username, password } = value;

    // Verify credentials
    const user = await userDb.verifyPassword(username, password);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Generate JWT token
    const token = generateToken({ 
      userId: user.id, 
      username: user.username 
    });

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        created_at: user.created_at
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      code: 'LOGIN_ERROR'
    });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user.id,
        username: req.user.username,
        created_at: req.user.created_at
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to get user information',
      code: 'USER_INFO_ERROR'
    });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    // Generate new token with same payload
    const token = generateToken({ 
      userId: req.user.id, 
      username: req.user.username 
    });

    res.json({
      message: 'Token refreshed successfully',
      token
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      error: 'Failed to refresh token',
      code: 'TOKEN_REFRESH_ERROR'
    });
  }
});

// Logout (client-side should discard token)
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // In a more complete implementation, you might want to blacklist the token
    res.json({
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
});

// Get user statistics (admin-like endpoint for demo)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userCount = await userDb.count();
    
    res.json({
      stats: {
        totalUsers: userCount,
        currentUser: req.user.username,
        serverTime: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Failed to get statistics',
      code: 'STATS_ERROR'
    });
  }
});

export default router;