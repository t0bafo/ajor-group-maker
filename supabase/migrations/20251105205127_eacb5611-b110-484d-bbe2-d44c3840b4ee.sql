-- Add UPDATE and DELETE RLS policies to members table

-- Policy 1: Allow members to update their own profile information
CREATE POLICY "Members can update own profile"
ON public.members FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 2: Allow hosts to update any member in their groups
CREATE POLICY "Hosts can update group members"
ON public.members FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = members.group_id
    AND groups.host_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = members.group_id
    AND groups.host_id = auth.uid()
  )
);

-- Policy 3: Allow hosts to remove members from their groups
CREATE POLICY "Hosts can delete group members"
ON public.members FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = members.group_id
    AND groups.host_id = auth.uid()
  )
);

-- Policy 4: Allow members to remove themselves from groups
CREATE POLICY "Members can leave groups"
ON public.members FOR DELETE
TO authenticated
USING (user_id = auth.uid());