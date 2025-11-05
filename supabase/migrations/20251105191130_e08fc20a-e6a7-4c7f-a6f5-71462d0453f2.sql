-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.members;

-- Create a security definer function to check if user is in a group
CREATE OR REPLACE FUNCTION public.is_user_in_group(_user_id uuid, _group_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.members
    WHERE user_id = _user_id
      AND group_id = _group_id
  ) OR EXISTS (
    SELECT 1
    FROM public.groups
    WHERE id = _group_id
      AND host_id = _user_id
  )
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Users can view members of their groups" 
ON public.members 
FOR SELECT 
USING (
  public.is_user_in_group(auth.uid(), group_id)
);