import { verifyToken, extractTokenFromHeader } from '../utils/jwt.js';
import { userDb } from '../database/db.js';

// Middleware to authenticate requests using JWT tokens
export async function authenticateToken(req, res, next) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'TOKEN_MISSING'
      });
    }

    // Verify the token
    const decoded = verifyToken(token);
    
    // Get fresh user data from database
    const user = await userDb.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Add user info to request object
    req.user = user;
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    let statusCode = 401;
    let errorCode = 'TOKEN_INVALID';
    
    if (error.message === 'Token expired') {
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.message === 'Token not active yet') {
      errorCode = 'TOKEN_NOT_ACTIVE';
    }
    
    return res.status(statusCode).json({ 
      error: error.message || 'Authentication failed',
      code: errorCode
    });
  }
}

// Optional authentication middleware (doesn't fail if no token)
export async function optionalAuth(req, res, next) {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (token) {
      const decoded = verifyToken(token);
      const user = await userDb.findById(decoded.userId);
      
      if (user) {
        req.user = user;
        req.token = token;
      }
    }
    
    next();
  } catch (error) {
    // For optional auth, we don't fail the request
    // Just log the error and continue without user info
    console.warn('Optional authentication failed:', error.message);
    next();
  }
}

// Middleware to check if user owns a resource
export function requireOwnership(resourceIdParam = 'id', userIdField = 'user_id') {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ 
          error: 'Authentication required',
          code: 'AUTH_REQUIRED'
        });
      }

      // This middleware should be used after a middleware that fetches the resource
      // and adds it to req.resource
      if (req.resource && req.resource[userIdField] !== req.user.id) {
        return res.status(403).json({ 
          error: 'Access denied: You can only modify your own resources',
          code: 'OWNERSHIP_REQUIRED'
        });
      }

      next();
    } catch (error) {
      console.error('Ownership check error:', error.message);
      return res.status(500).json({ 
        error: 'Server error during authorization',
        code: 'AUTH_SERVER_ERROR'
      });
    }
  };
}

// Rate limiting middleware (simple in-memory implementation)
const rateLimits = new Map();

export function rateLimit({ windowMs = 15 * 60 * 1000, maxRequests = 100 } = {}) {
  return (req, res, next) => {
    const identifier = req.user?.id || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Clean up old entries
    for (const [key, requests] of rateLimits.entries()) {
      rateLimits.set(key, requests.filter(timestamp => timestamp > windowStart));
      if (rateLimits.get(key).length === 0) {
        rateLimits.delete(key);
      }
    }
    
    // Check current user's requests
    const userRequests = rateLimits.get(identifier) || [];
    const recentRequests = userRequests.filter(timestamp => timestamp > windowStart);
    
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    recentRequests.push(now);
    rateLimits.set(identifier, recentRequests);
    
    // Add rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - recentRequests.length - 1),
      'X-RateLimit-Reset': Math.ceil((windowStart + windowMs) / 1000)
    });
    
    next();
  };
}