/**
 * Locations Controller
 * Handles CRUD operations for location pages
 */

const path = require('path');
const fs = require('fs').promises;
const db = require('../config/database');

/**
 * Get all locations
 * Returns list of active locations
 */
async function getLocations(req, res) {
  try {
    const { region } = req.query;
    
    let sql = `
      SELECT id, slug, title, company_name, address, latitude, longitude, 
             learn_more_url, region, hero_image, content, meta_description
      FROM locations
      WHERE is_active = TRUE
    `;
    const params = [];
    
    if (region) {
      sql += ' AND region = ?';
      params.push(region);
    }
    
    sql += ' ORDER BY region, display_order ASC';
    
    const locations = await db.query(sql, params);
    
    res.json({
      success: true,
      locations: locations
    });
    
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve locations'
    });
  }
}

/**
 * Get all locations for admin
 * Includes inactive locations
 */
async function getLocationsAdmin(req, res) {
  try {
    const sql = `
      SELECT 
        l.id,
        l.slug,
        l.title,
        l.company_name,
        l.address,
        l.latitude,
        l.longitude,
        l.learn_more_url,
        l.region,
        l.display_order,
        l.is_active,
        l.updated_at,
        u.username as updated_by
      FROM locations l
      LEFT JOIN users u ON l.updated_by = u.id
      ORDER BY l.display_order ASC
    `;
    
    const locations = await db.query(sql);
    
    res.json({
      success: true,
      locations: locations
    });
    
  } catch (error) {
    console.error('Get admin locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve locations'
    });
  }
}

/**
 * Get single location for admin
 * Returns full details including all metadata
 */
async function getLocationByIdAdmin(req, res) {
  try {
    const { id } = req.params;
    
    const sql = `
      SELECT *
      FROM locations
      WHERE id = ?
      LIMIT 1
    `;
    
    const locations = await db.query(sql, [id]);
    
    if (locations.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    res.json({
      success: true,
      location: locations[0]
    });
    
  } catch (error) {
    console.error('Get admin location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve location'
    });
  }
}

/**
 * Update location
 * Updates location content and metadata
 */
async function updateLocation(req, res) {
  try {
    const { id } = req.params;
    const { title, company, address, latitude, longitude, learnMoreUrl, region, content, meta_description, services, contact_info, display_order, is_active } = req.body;
    const userId = req.session.userId;
    
    const sql = `
      UPDATE locations
      SET title = ?, company_name = ?, address = ?, latitude = ?, longitude = ?, 
          learn_more_url = ?, region = ?, content = ?, meta_description = ?, 
          services = ?, contact_info = ?, display_order = ?, is_active = ?, updated_by = ?
      WHERE id = ?
    `;
    
    const params = [
      title,
      company || null,
      address || null,
      latitude || null,
      longitude || null,
      learnMoreUrl || null,
      region || 'western_canada',
      content || null,
      meta_description || null,
      services ? JSON.stringify(services) : null,
      contact_info ? JSON.stringify(contact_info) : null,
      display_order || 0,
      is_active !== undefined ? is_active : true,
      userId,
      id
    ];
    
    const result = await db.query(sql, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Location not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Location updated successfully'
    });
    
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location'
    });
  }
}

/**
 * Get map locations with coordinates
 * Returns locations for map display
 */
async function getMapLocations(req, res) {
  try {
    const sql = `
      SELECT 
        l.id, 
        l.title,
        l.company_name,
        l.address,
        l.latitude,
        l.longitude,
        l.learn_more_url
      FROM locations l
      WHERE l.is_active = TRUE
      ORDER BY l.display_order ASC
    `;
    
    const locations = await db.query(sql);
    
    res.json({
      success: true,
      locations: locations
    });
    
  } catch (error) {
    console.error('Get map locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve map locations'
    });
  }
}

module.exports = {
  getLocations,
  getLocationsAdmin,
  getLocationByIdAdmin,
  updateLocation,
  getMapLocations
};