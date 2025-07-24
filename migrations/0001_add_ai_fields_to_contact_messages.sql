
-- Add AI categorization fields to contact_messages table
ALTER TABLE contact_messages 
ADD COLUMN ai_category VARCHAR(50) DEFAULT 'general_inquiry',
ADD COLUMN suggested_response TEXT;
