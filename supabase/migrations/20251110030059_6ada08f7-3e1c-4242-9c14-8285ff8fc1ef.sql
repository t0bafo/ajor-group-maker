-- Layer 4: Add unique constraint on invite_code to prevent duplicates at database level
-- This ensures even if client-side checks fail, duplicates cannot be created

-- First, check if any duplicate invite codes exist (unlikely but possible)
-- We'll add a comment about this for monitoring
COMMENT ON COLUMN public.groups.invite_code IS 'Unique invite code for group - must be unique across all groups';

-- Add unique constraint on invite_code
-- This will fail if there are any existing duplicates
ALTER TABLE public.groups 
ADD CONSTRAINT groups_invite_code_unique UNIQUE (invite_code);

-- Add index for faster lookups by invite code
CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON public.groups(invite_code) WHERE invite_code IS NOT NULL;