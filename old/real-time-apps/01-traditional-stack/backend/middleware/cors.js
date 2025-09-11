import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:5173',
      'http://localhost:3000',  // Common React dev port
      'http://localhost:5173',  // Vite default port
      'http://127.0.0.1:5173',  // Alternative localhost
      'http://127.0.0.1:3000'   // Alternative localhost
    ];
    
    // In development, allow any localhost origin
    if (process.env.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS: Blocked origin ${origin}`);
      callback(new Error('Not allowed by CORS policy'), false);
    }
  },
  
  credentials: true, // Allow cookies and authorization headers
  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Auth-Token'
  ],
  
  exposedHeaders: [
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining', 
    'X-RateLimit-Reset',
    'X-Total-Count'
  ],
  
  // Preflight cache time (24 hours)
  maxAge: 24 * 60 * 60,
  
  // Handle preflight requests
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// CORS error handler
corsOptions.origin = function (origin, callback) {
  try {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000'
    ];
    
    // Development mode - allow localhost
    if (process.env.NODE_ENV === 'development') {
      const isLocalhost = origin.includes('localhost') || 
                         origin.includes('127.0.0.1') ||
                         origin.startsWith('http://192.168.');
      
      if (isLocalhost) {
        return callback(null, true);
      }
    }
    
    // Production mode - strict checking
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log blocked requests in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`CORS: Origin ${origin} not in allowed list:`, allowedOrigins);
    }
    
    callback(new Error(`CORS: Origin ${origin} not allowed`), false);
    
  } catch (error) {
    console.error('CORS origin check error:', error);
    callback(error, false);
  }
};

export default cors(corsOptions);