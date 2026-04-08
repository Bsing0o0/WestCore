-- Westcore Links Database Schema
-- Run this script to create the database structure

-- Create database
CREATE DATABASE IF NOT EXISTS westcore_links CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE westcore_links;

-- Users table (for admin authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    role ENUM('admin', 'editor') DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB;

-- Gallery images table
CREATE TABLE IF NOT EXISTS gallery_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    title VARCHAR(200),
    description TEXT,
    alt_text VARCHAR(200),
    display_order INT DEFAULT 0,
    uploaded_by INT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_display_order (display_order),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB;

-- Locations table (for dynamic location content management)
CREATE TABLE IF NOT EXISTS locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    address VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    region ENUM('western_canada', 'eastern_canada', 'usa') NOT NULL,
    hero_image VARCHAR(500),
    content TEXT,
    meta_description VARCHAR(300),
    services JSON,
    contact_info JSON,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    updated_by INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_region (region),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB;

-- Location notes table (for storing user notes about locations)
CREATE TABLE IF NOT EXISTS location_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_location_id (location_id)
) ENGINE=InnoDB;

-- Location images table (additional images for location pages)
CREATE TABLE IF NOT EXISTS location_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    caption VARCHAR(300),
    display_order INT DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_location_id (location_id),
    INDEX idx_display_order (display_order)
) ENGINE=InnoDB;

-- Sessions table (for express-session with MySQL store)
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) PRIMARY KEY,
    expires INT UNSIGNED NOT NULL,
    data MEDIUMTEXT,
    INDEX idx_expires (expires)
) ENGINE=InnoDB;

-- Insert default admin user (password: changeme123)
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO users (username, password_hash, email, role) VALUES
('admin', '$2b$10$A89FzyJoQ/R/f9qd57R/peMGpW1rWeO2Oke3gv/7j4cB1uVR5.8n6', 'admin@westcorelinks.com', 'admin')
ON DUPLICATE KEY UPDATE username=username;

-- Insert company location data with addresses
INSERT INTO locations (slug, title, address, region, display_order) VALUES
('nisku-site-a', 'Nisku Site A', '2308 4 St Nisku, AB', 'western_canada', 1),
('nisku-site-b', 'Nisku Site B', '2306 4th St, Nisku, AB T9E-7W5', 'western_canada', 2),
('tillsonburg', 'Tillsonburg', '85 Spruce St, Tillsonburg, ON N4G 5C4', 'eastern_canada', 3),
('houston', 'Houston', '2928 Greens Road B-100, Houston, TX 77032', 'usa', 4),
('montreal-yard', 'Montreal Yard', 'Montreal, QC', 'eastern_canada', 5)
ON DUPLICATE KEY UPDATE slug=slug;

-- Create views for reporting
CREATE OR REPLACE VIEW active_gallery_images AS
SELECT 
    gi.id,
    gi.filename,
    gi.original_name,
    gi.file_path,
    gi.title,
    gi.description,
    gi.uploaded_at,
    u.username as uploaded_by_user
FROM gallery_images gi
LEFT JOIN users u ON gi.uploaded_by = u.id
WHERE gi.is_active = TRUE
ORDER BY gi.display_order, gi.uploaded_at DESC;

CREATE OR REPLACE VIEW locations_summary AS
SELECT 
    l.id,
    l.slug,
    l.title,
    l.region,
    l.is_active,
    l.updated_at,
    u.username as updated_by_user,
    COUNT(li.id) as image_count
FROM locations l
LEFT JOIN users u ON l.updated_by = u.id
LEFT JOIN location_images li ON l.id = li.location_id
GROUP BY l.id
ORDER BY l.region, l.display_order;