-- Add maintenance tracking columns to inventory_items
ALTER TABLE public.inventory_items 
ADD COLUMN last_maintenance_date date,
ADD COLUMN next_maintenance_date date,
ADD COLUMN maintenance_interval_days integer,
ADD COLUMN maintenance_notes text;