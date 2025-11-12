-- Add RLS policy to allow admins to delete groups
CREATE POLICY "Admins can delete all groups"
ON public.groups
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));