-- Create rate_limit table for API protection
CREATE TABLE IF NOT EXISTS public.rate_limit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rate_limit ENABLE ROW LEVEL SECURITY;

-- Create indexes for efficient lookups and cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup 
ON public.rate_limit(ip_address, endpoint, created_at);

CREATE INDEX IF NOT EXISTS idx_rate_limit_cleanup 
ON public.rate_limit(created_at);

-- Add constraint to members table to prevent user_id from being set back to NULL once claimed
-- This ensures that once a member claims their account, they remain associated
CREATE OR REPLACE FUNCTION public.prevent_user_id_removal()
RETURNS TRIGGER AS $$
BEGIN
  -- If user_id is being changed from a value to NULL, prevent it
  IF OLD.user_id IS NOT NULL AND NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'Cannot remove user_id once set. User ID: %', OLD.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to enforce the constraint
DROP TRIGGER IF EXISTS prevent_user_id_removal_trigger ON public.members;
CREATE TRIGGER prevent_user_id_removal_trigger
BEFORE UPDATE ON public.members
FOR EACH ROW
EXECUTE FUNCTION public.prevent_user_id_removal();