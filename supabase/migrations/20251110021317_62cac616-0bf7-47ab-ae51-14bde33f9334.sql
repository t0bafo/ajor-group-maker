-- Fix infinite recursion in RLS policies by simplifying them

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.members;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Users can view members of their groups"
ON public.members
FOR SELECT
USING (
  -- User can see their own record (pending, approved, or rejected)
  (user_id = auth.uid())
  OR
  -- User can see approved members in groups they're an approved member of
  (status = 'approved' AND EXISTS (
    SELECT 1 FROM public.members AS m
    WHERE m.group_id = members.group_id
    AND m.user_id = auth.uid()
    AND m.status = 'approved'
  ))
  OR
  -- Host can see all members (pending, approved, rejected)
  (EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = members.group_id
    AND groups.host_id = auth.uid()
  ))
);