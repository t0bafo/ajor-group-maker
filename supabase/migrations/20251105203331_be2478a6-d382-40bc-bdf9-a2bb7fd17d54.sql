-- Remove the overly permissive policy that allows any authenticated user to view all groups with invite codes
DROP POLICY IF EXISTS "Authenticated users can view groups with invite code" ON public.groups;

-- The remaining policies are sufficient:
-- 1. "Users can view groups they are host of" - Hosts can see their own groups
-- 2. "Users can view groups they are members of" - Members can see groups they've joined
-- This ensures users can only see groups they're actually part of