/**
 * Public Routes
 * Routes accessible to all website visitors
 */

const express = require('express');
const path = require('path');
const router = express.Router();

// Import controllers
const galleryController = require('../controllers/galleryController');
const locationsController = require('../controllers/locationsController');

// ============================================================================
// PUBLIC PAGES
// ============================================================================

// Home page
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});

// About page
router.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'about.html'));
});

// Services page
router.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'services.html'));
});

// Careers page
router.get('/careers', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'careers.html'));
});

// Gallery page
router.get('/gallery', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'gallery.html'));
});

// Contact page
router.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'contact.html'));
});

// NorthHaul page
router.get('/northhaul', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'northhaul.html'));
});

// WestCore page
router.get('/westcore', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'westcore.html'));
});

// Storage page
router.get('/storage', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'storage.html'));
});

// ============================================================================
// LOCATION PAGES
// ============================================================================

// Western Canada
router.get('/locations/western-canada', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'locations', 'western-canada.html'));
});

// Eastern Canada
router.get('/locations/eastern-canada', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'locations', 'eastern-canada.html'));
});

// USA
router.get('/locations/usa', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'locations', 'usa.html'));
});

// ============================================================================
// PUBLIC API ROUTES
// ============================================================================

// Get gallery images (public view - only active images)
router.get('/api/public/gallery', galleryController.getGalleryImages);

// Get locations (public view - only active locations)
router.get('/api/public/locations', locationsController.getLocations);

// Get map locations with coordinates
router.get('/api/public/map-locations', locationsController.getMapLocations);

module.exports = router;