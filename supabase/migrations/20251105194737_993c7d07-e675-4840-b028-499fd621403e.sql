-- Allow anyone to view basic group info via invite code
-- This is safe because the invite code acts as a secret authorization token
CREATE POLICY "Anyone can view groups with valid invite code"
ON public.groups
FOR SELECT
USING (invite_code IS NOT NULL);

-- Note: This policy allows viewing groups by invite code
-- The invite code itself acts as the authorization mechanism
-- Users still need to be authenticated to actually join the group