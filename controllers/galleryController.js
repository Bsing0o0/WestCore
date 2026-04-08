/**
 * Gallery Controller
 * Handles image upload, retrieval, and deletion for gallery
 */

const path = require('path');
const fs = require('fs').promises;
const db = require('../config/database');

/**
 * Get all gallery images
 * Returns list of active images for public display
 */
async function getGalleryImages(req, res) {
  try {
    const sql = `
      SELECT id, filename, file_path, title, description, alt_text, uploaded_at
      FROM gallery_images
      WHERE is_active = TRUE
      ORDER BY display_order ASC, uploaded_at DESC
    `;
    
    const images = await db.query(sql);
    
    res.json({
      success: true,
      images: images
    });
    
  } catch (error) {
    console.error('Get gallery images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve gallery images'
    });
  }
}

/**
 * Get all gallery images for admin
 * Includes inactive images and additional metadata
 */
async function getGalleryImagesAdmin(req, res) {
  try {
    const sql = `
      SELECT 
        gi.id, 
        gi.filename, 
        gi.original_name,
        gi.file_path, 
        gi.file_size,
        gi.title, 
        gi.description, 
        gi.alt_text,
        gi.display_order,
        gi.is_active,
        gi.uploaded_at,
        u.username as uploaded_by
      FROM gallery_images gi
      LEFT JOIN users u ON gi.uploaded_by = u.id
      ORDER BY gi.display_order ASC, gi.uploaded_at DESC
    `;
    
    const images = await db.query(sql);
    
    res.json({
      success: true,
      images: images
    });
    
  } catch (error) {
    console.error('Get admin gallery images error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve gallery images'
    });
  }
}

/**
 * Upload new gallery image
 * Saves file and creates database record
 */
async function uploadGalleryImage(req, res) {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }
    
    const { title, description, alt_text } = req.body;
    const userId = req.session.userId;
    
    // Prepare database record
    const sql = `
      INSERT INTO gallery_images 
      (filename, original_name, file_path, file_size, mime_type, title, description, alt_text, uploaded_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      req.file.filename,
      req.file.originalname,
      '/uploads/gallery/' + req.file.filename,
      req.file.size,
      req.file.mimetype,
      title || null,
      description || null,
      alt_text || null,
      userId
    ];
    
    const result = await db.query(sql, params);
    
    res.json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        id: result.insertId,
        filename: req.file.filename,
        file_path: '/uploads/gallery/' + req.file.filename,
        title: title || null
      }
    });
    
  } catch (error) {
    console.error('Upload gallery image error:', error);
    
    // Clean up uploaded file if database insert fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
}

/**
 * Update gallery image metadata
 * Updates title, description, alt text, etc.
 */
async function updateGalleryImage(req, res) {
  try {
    const { id } = req.params;
    const { title, description, alt_text, display_order, is_active } = req.body;
    
    const sql = `
      UPDATE gallery_images 
      SET title = ?, description = ?, alt_text = ?, display_order = ?, is_active = ?
      WHERE id = ?
    `;
    
    const params = [
      title || null,
      description || null,
      alt_text || null,
      display_order || 0,
      is_active !== undefined ? is_active : true,
      id
    ];
    
    const result = await db.query(sql, params);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Image updated successfully'
    });
    
  } catch (error) {
    console.error('Update gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update image'
    });
  }
}

/**
 * Delete gallery image
 * Removes file from disk and database record
 */
async function deleteGalleryImage(req, res) {
  try {
    const { id } = req.params;
    
    // Get image info before deleting
    const selectSql = 'SELECT filename FROM gallery_images WHERE id = ?';
    const images = await db.query(selectSql, [id]);
    
    if (images.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }
    
    const filename = images[0].filename;
    const filePath = path.join(__dirname, '..', 'public', 'uploads', 'gallery', filename);
    
    // Delete from database
    const deleteSql = 'DELETE FROM gallery_images WHERE id = ?';
    await db.query(deleteSql, [id]);
    
    // Delete file from disk
    try {
      await fs.unlink(filePath);
    } catch (fileError) {
      // Log error but don't fail the request
      console.error('Error deleting file from disk:', fileError.message);
    }
    
    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
}

module.exports = {
  getGalleryImages,
  getGalleryImagesAdmin,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage
};