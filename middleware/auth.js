/**
 * Authentication and Authorization Middleware
 * Protects admin routes and validates user sessions
 */

/**
 * Check if user is authenticated
 * Protects routes from unauthorized access
 */
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId && req.session.isAuthenticated) {
    return next();
  }
  
  // For API requests, return JSON error
  if (req.path.startsWith('/api/')) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  
  // For page requests, redirect to login
  res.redirect('/admin/login');
}

/**
 * Check if user has admin role
 * Additional layer for role-based access control
 */
function isAdmin(req, res, next) {
  if (req.session && req.session.role === 'admin') {
    return next();
  }
  
  if (req.path.startsWith('/api/')) {
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required'
    });
  }
  
  res.status(403).send('Access denied');
}

/**
 * Check if user is already logged in
 * Redirects authenticated users away from login page
 */
function isGuest(req, res, next) {
  if (req.session && req.session.isAuthenticated) {
    return res.redirect('/admin/dashboard');
  }
  next();
}

/**
 * Attach user info to request object
 * Makes user data available in routes
 */
function attachUser(req, res, next) {
  if (req.session && req.session.userId) {
    req.user = {
      id: req.session.userId,
      username: req.session.username,
      role: req.session.role
    };
  }
  next();
}

/**
 * Security headers middleware
 * Adds security-related HTTP headers
 */
function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
}

module.exports = {
  isAuthenticated,
  isAdmin,
  isGuest,
  attachUser,
  securityHeaders
};