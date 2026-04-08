/**
 * Westcore Links - Main Express Server
 * Production-ready trucking company website with admin panel
 */

const express = require('express');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
require('dotenv').config();

// Import configurations and middleware
const db = require('./config/database');
const { securityHeaders, attachUser } = require('./middleware/auth');

// Import routes
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================================================
// SECURITY MIDDLEWARE
// ============================================================================

// Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      connectSrc: ["'self'", "https://nominatim.openstreetmap.org", "https://unpkg.com"]
    }
  },
  crossOriginEmbedderPolicy: false
}));

// Custom security headers
app.use(securityHeaders);

// Rate limiting for API endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);

// ============================================================================
// BODY PARSING & SESSION
// ============================================================================

// Parse JSON and URL-encoded bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  },
  name: 'westcore.sid' // Custom session name
}));

// Attach user info to all requests
app.use(attachUser);

// ============================================================================
// FILE UPLOAD CONFIGURATION
// ============================================================================

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on upload type
    const uploadType = req.path.includes('locations') ? 'locations' : 'gallery';
    cb(null, path.join(__dirname, 'public', 'uploads', uploadType));
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'img-' + uniqueSuffix + ext);
  }
});

// File filter for image validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_IMAGE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || 5242880) // 5MB default
  },
  fileFilter: fileFilter
});

// Make upload middleware available to routes
app.locals.upload = upload;

// ============================================================================
// STATIC FILES
// ============================================================================

// Serve static files
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// ============================================================================
// ROUTES
// ============================================================================

// Public routes
app.use('/', publicRoutes);

// Admin routes
app.use('/admin', adminRoutes);

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Handle multer errors
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds maximum allowed size'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  // Handle other errors
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'An error occurred' 
      : err.message
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await db.testConnection();
    
    if (!dbConnected) {
      console.error('Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log('='.repeat(50));
      console.log('Westcore Links Server');
      console.log('='.repeat(50));
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Server running on: http://localhost:${PORT}`);
      console.log(`Admin panel: http://localhost:${PORT}/admin`);
      console.log('='.repeat(50));
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('\nSIGTERM received. Shutting down gracefully...');
      server.close(async () => {
        await db.closePool();
        console.log('Server closed');
        process.exit(0);
      });
    });
    
    process.on('SIGINT', () => {
      console.log('\nSIGINT received. Shutting down gracefully...');
      server.close(async () => {
        await db.closePool();
        console.log('Server closed');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;