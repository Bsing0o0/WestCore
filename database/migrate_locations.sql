-- Migration: Add address and coordinates to locations table
USE westcore_links;

-- Add new columns to locations table
ALTER TABLE locations 
ADD COLUMN IF NOT EXISTS address VARCHAR(500) AFTER title,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8) AFTER address,
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8) AFTER latitude;

-- Create location_notes table
CREATE TABLE IF NOT EXISTS location_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
    INDEX idx_location_id (location_id)
) ENGINE=InnoDB;

-- Clear old sample data
DELETE FROM locations;

-- Insert company location data with addresses
INSERT INTO locations (slug, title, address, region, display_order) VALUES
('nisku-site-a', 'Nisku Site A', '2308 4 St Nisku, AB', 'western_canada', 1),
('nisku-site-b', 'Nisku Site B', '2306 4 St, Nisku, AB', 'western_canada', 2),
('tillsonburg', 'Tillsonburg', '85 Spruce St, Tillsonburg, ON N4G 5C4', 'eastern_canada', 3),
('houston', 'Houston', '2928 Greens Road, Houston, TX 77032', 'usa', 4),
('montreal-yard', 'Montreal Yard', 'Montreal, QC', 'eastern_canada', 5)
ON DUPLICATE KEY UPDATE 
    address = VALUES(address),
    region = VALUES(region),
    display_order = VALUES(display_order);
