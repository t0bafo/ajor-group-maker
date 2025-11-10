-- Add membership approval fields to members table
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS join_message TEXT;

-- Add constraint to ensure status is one of the allowed values
ALTER TABLE public.members
ADD CONSTRAINT members_status_check 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add group settings for approval flow
ALTER TABLE public.groups
ADD COLUMN IF NOT EXISTS auto_approve_members BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS request_expiry_days INTEGER DEFAULT 14,
ADD COLUMN IF NOT EXISTS send_rejection_email BOOLEAN NOT NULL DEFAULT false;

-- Create index for faster pending request queries
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_members_group_status ON public.members(group_id, status);

-- Update RLS policies to handle pending members

-- Drop existing policy and recreate with pending status consideration
DROP POLICY IF EXISTS "Users can view members of their groups" ON public.members;

CREATE POLICY "Users can view members of their groups"
ON public.members
FOR SELECT
USING (
  -- User can see approved members if they're in the group
  (status = 'approved' AND is_user_in_group(auth.uid(), group_id))
  OR
  -- User can see their own pending/rejected request
  (user_id = auth.uid())
  OR
  -- Host can see all members including pending
  (EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = members.group_id
    AND groups.host_id = auth.uid()
  ))
);

-- Update the policy for adding members to include status
DROP POLICY IF EXISTS "Users can add themselves to groups via invite" ON public.members;

CREATE POLICY "Users can add themselves to groups via invite"
ON public.members
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND status IN ('pending', 'approved')
);

-- Hosts can update member status for approval/rejection
DROP POLICY IF EXISTS "Hosts can update group members" ON public.members;

CREATE POLICY "Hosts can update group members"
ON public.members
FOR UPDATE
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

-- Create function to count approved members only
CREATE OR REPLACE FUNCTION public.count_approved_members(group_id_param uuid)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.members
  WHERE group_id = group_id_param
  AND status = 'approved'
$$;

-- Create function to check if group is full (approved members only)
CREATE OR REPLACE FUNCTION public.is_group_full(group_id_param uuid)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT COUNT(*)
    FROM public.members
    WHERE group_id = group_id_param
    AND status = 'approved'
  ) >= (
    SELECT number_of_members
    FROM public.groups
    WHERE id = group_id_param
  )
$$;

-- Auto-expire old pending requests (called by cron or manually)
CREATE OR REPLACE FUNCTION public.expire_old_pending_requests()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  WITH expired_requests AS (
    UPDATE public.members m
    SET status = 'rejected',
        rejection_reason = 'Request expired',
        reviewed_at = now()
    FROM public.groups g
    WHERE m.group_id = g.id
    AND m.status = 'pending'
    AND g.request_expiry_days IS NOT NULL
    AND m.requested_at < (now() - (g.request_expiry_days || ' days')::INTERVAL)
    RETURNING m.id
  )
  SELECT COUNT(*)::INTEGER INTO expired_count FROM expired_requests;
  
  RETURN expired_count;
END;
$$;