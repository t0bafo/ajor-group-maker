-- Fix infinite recursion by simplifying ALL policies to avoid circular dependencies

-- ==========================================
-- GROUPS TABLE POLICIES (Fix the recursion)
-- ==========================================

-- Drop existing policies on groups
DROP POLICY IF EXISTS "Users can view groups they are host of" ON public.groups;
DROP POLICY IF EXISTS "Users can view groups they are members of" ON public.groups;

-- Recreate with simpler logic
CREATE POLICY "Users can view groups they are host of"
ON public.groups
FOR SELECT
USING (auth.uid() = host_id);

CREATE POLICY "Users can view groups they are members of"
ON public.groups
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.members
    WHERE members.group_id = groups.id
    AND members.user_id = auth.uid()
    AND members.status = 'approved'
  )
);

-- ==========================================
-- MEMBERS TABLE POLICIES (Simplified)
-- ==========================================

-- Drop and recreate the members view policy to be even simpler
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.members;

CREATE POLICY "Users can view members of their groups"
ON public.members
FOR SELECT
USING (
  -- User can see their own record regardless of status
  user_id = auth.uid()
  OR
  -- User can see approved members in groups where they are an approved member
  (
    status = 'approved' 
    AND group_id IN (
      SELECT group_id FROM public.members 
      WHERE user_id = auth.uid() 
      AND status = 'approved'
    )
  )
  OR
  -- Hosts can see all members (using direct group check, not is_user_in_group)
  group_id IN (
    SELECT id FROM public.groups WHERE host_id = auth.uid()
  )
);