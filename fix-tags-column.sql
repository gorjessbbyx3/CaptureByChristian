-- Fix tags column type conversion issue
-- This script handles the conversion of tags column to text[] type

-- For clients table
ALTER TABLE clients 
ALTER COLUMN tags TYPE text[] USING 
    CASE 
        WHEN tags IS NULL THEN '{}'::text[]
        WHEN tags = '' THEN '{}'::text[]
        ELSE string_to_array(trim(both '"' from tags::text), ',')
    END;

-- For gallery_images table  
ALTER TABLE gallery_images 
ALTER COLUMN tags TYPE text[] USING 
    CASE 
        WHEN tags IS NULL THEN '{}'::text[]
        WHEN tags = '' THEN '{}'::text[]
        ELSE string_to_array(trim(both '"' from tags::text), ',')
    END;
