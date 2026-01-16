-- Add CHECK constraint to validate table_number format
-- Allows alphanumeric characters, hyphens, and underscores, max 20 characters
ALTER TABLE public.orders 
ADD CONSTRAINT valid_table_number 
CHECK (table_number ~ '^[0-9A-Za-z_-]{1,20}$');