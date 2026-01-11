-- Create storage bucket for menu item images
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-images', 'menu-images', true);

-- Allow authenticated staff to upload menu images
CREATE POLICY "Staff can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images' 
  AND is_staff_or_higher(auth.uid())
);

-- Allow authenticated staff to update menu images
CREATE POLICY "Staff can update menu images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'menu-images' 
  AND is_staff_or_higher(auth.uid())
);

-- Allow authenticated staff to delete menu images
CREATE POLICY "Staff can delete menu images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menu-images' 
  AND is_staff_or_higher(auth.uid())
);

-- Allow public read access to menu images
CREATE POLICY "Anyone can view menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');