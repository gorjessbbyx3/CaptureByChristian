-- Initialize database with sample data
-- This script runs when the database container starts for the first time

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sample clients
INSERT INTO clients (name, email, phone, created_at) VALUES 
('John Smith', 'john@example.com', '555-0123', NOW()),
('Sarah Johnson', 'sarah@example.com', '555-0456', NOW()),
('Michael Chen', 'michael@example.com', '555-0789', NOW())
ON CONFLICT (email) DO NOTHING;

-- Sample services
INSERT INTO services (name, description, price, duration, category, active) VALUES 
('Wedding Photography', 'Complete wedding photography coverage with edited gallery', 2500.00, 8, 'wedding', true),
('Portrait Session', 'Professional portrait photography session', 350.00, 2, 'portrait', true),
('Real Estate Photography', 'Professional real estate photography for listings', 450.00, 3, 'real_estate', true),
('Event Photography', 'Corporate and private event photography', 800.00, 4, 'event', true)
ON CONFLICT (name) DO NOTHING;

-- Business profile
INSERT INTO profiles (name, title, bio, phone, email, address, social_media, is_active, created_at) VALUES 
('CapturedCCollective', 'Hawaii Media Collective', 'Hawai''i-based media team blending professionalism with creativity to deliver cinematic, high-impact content. The double "C" stands for Content and Cinematic, with Creative storytelling focus. From real estate and events to branded visuals, we approach every project with intentionality, artistry, and precision - capturing more than just moments, but emotion, energy, and vision.', '808-555-0123', 'info@capturedccollective.com', 'Honolulu, HI', '{"instagram": "@capturedccollective", "facebook": "CapturedCCollective"}', true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Create admin user (password should be hashed in production)
INSERT INTO users (username, email, password_hash, role, created_at) VALUES 
('admin', 'admin@capturedccollective.com', '$2b$10$example_hash_here', 'admin', NOW())
ON CONFLICT (username) DO NOTHING;