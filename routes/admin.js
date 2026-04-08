/**
 * Admin Routes
 * Protected routes for admin panel functionality
 */

const express = require('express');
const path = require('path');
const router = express.Router();

// Import middleware
const { isAuthenticated, isGuest } = require('../middleware/auth');

// Import controllers
const authController = require('../controllers/authController');
const galleryController = require('../controllers/galleryController');
const locationsController = require('../controllers/locationsController');

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Login page (only accessible when not logged in)
router.get('/login', isGuest, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'admin', 'login.html'));
});

// Login API
router.post('/api/auth/login', authController.login);

// Logout API
router.post('/api/auth/logout', isAuthenticated, authController.logout);

// Check auth status
router.get('/api/auth/status', authController.checkAuth);

// Change password
router.post('/api/auth/change-password', isAuthenticated, authController.changePassword);

// ============================================================================
// ADMIN PAGES (Protected)
// ============================================================================

// Dashboard
router.get('/dashboard', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'admin', 'dashboard.html'));
});

// Gallery management page
router.get('/gallery', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'admin', 'gallery-manage.html'));
});

// Locations management page
router.get('/locations', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'admin', 'locations-manage.html'));
});

// ============================================================================
// GALLERY API ROUTES (Protected)
// ============================================================================

// Get all gallery images (admin view)
router.get('/api/gallery', isAuthenticated, galleryController.getGalleryImagesAdmin);

// Upload gallery image
router.post('/api/gallery/upload', isAuthenticated, (req, res, next) => {
  req.app.locals.upload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    galleryController.uploadGalleryImage(req, res);
  });
});

// Update gallery image metadata
router.put('/api/gallery/:id', isAuthenticated, galleryController.updateGalleryImage);

// Delete gallery image
router.delete('/api/gallery/:id', isAuthenticated, galleryController.deleteGalleryImage);

// ============================================================================
// LOCATIONS API ROUTES (Protected)
// ============================================================================

// Get all locations (admin view)
router.get('/api/locations', isAuthenticated, locationsController.getLocationsAdmin);

// Get single location by ID
router.get('/api/locations/:id', isAuthenticated, locationsController.getLocationByIdAdmin);

// Update location
router.put('/api/locations/:id', isAuthenticated, locationsController.updateLocation);

// ============================================================================
// REDIRECT ROOT TO DASHBOARD
// ============================================================================

// Redirect /admin to /admin/dashboard
router.get('/', isAuthenticated, (req, res) => {
  res.redirect('/admin/dashboard');
});

module.exports = router;