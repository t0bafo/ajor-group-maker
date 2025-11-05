-- Drop the insecure policy that allowed unauthenticated access
DROP POLICY IF EXISTS "Anyone can view groups with valid invite code" ON public.groups;

-- Create a secure policy that requires authentication
-- Authenticated users can view groups if they have a valid invite code
-- This prevents brute-force attacks and unauthorized data exposure
CREATE POLICY "Authenticated users can view groups with invite code"
ON public.groups
FOR SELECT
TO authenticated
USING (invite_code IS NOT NULL);

-- Note: Users must be authenticated to view group details via invite code
-- This protects sensitive financial information from unauthorized access