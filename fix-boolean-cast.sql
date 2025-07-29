-- Fix boolean cast issue for featured column in gallery_images table
-- This migration handles the conversion from existing data to boolean

-- Step 1: Create a temporary column
ALTER TABLE gallery_images ADD COLUMN featured_new boolean DEFAULT false;

-- Step 2: Convert existing data to boolean
-- Assuming featured was previously stored as text/integer, convert to boolean
UPDATE gallery_images 
SET featured_new = CASE 
    WHEN featured::text ILIKE 'true' OR featured::text = '1' OR featured::text ILIKE 't' THEN true
    WHEN featured IS NULL THEN false
    ELSE false
END;

-- Step 3: Drop the old column
ALTER TABLE gallery_images DROP COLUMN featured;

-- Step 4: Rename the new column to the original name
ALTER TABLE gallery_images RENAME COLUMN featured_new TO featured;

-- Step 5: Add any necessary constraints
ALTER TABLE gallery_images ALTER COLUMN featured SET DEFAULT false;
