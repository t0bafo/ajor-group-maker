-- Drop existing problematic policies that create circular dependencies
DROP POLICY IF EXISTS "Users can view groups they are members of" ON groups;
DROP POLICY IF EXISTS "Users can view members of their groups" ON members;

-- Create security definer function to check group membership (breaks circular dependency)
CREATE OR REPLACE FUNCTION public.is_approved_group_member(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members 
    WHERE group_id = _group_id 
    AND user_id = _user_id
    AND status = 'approved'
  );
$$;

-- Create security definer function to check if user is host
CREATE OR REPLACE FUNCTION public.is_group_host(_group_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups 
    WHERE id = _group_id 
    AND host_id = _user_id
  );
$$;

-- Recreate groups policy using security definer function (no direct members table reference in policy)
CREATE POLICY "Users can view groups they are members of"
ON groups
FOR SELECT
USING (public.is_approved_group_member(id, auth.uid()));

-- Recreate members policy using security definer function (no direct groups table reference in policy)
CREATE POLICY "Users can view members of their groups"
ON members
FOR SELECT
USING (
  user_id = auth.uid() 
  OR (status = 'approved' AND public.is_approved_group_member(group_id, auth.uid()))
  OR public.is_group_host(group_id, auth.uid())
);