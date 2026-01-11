-- Allow admins to view all profiles for user management
-- This policy already exists, but let's ensure it's correctly set up
-- First drop if exists to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Recreate the policy
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin'));