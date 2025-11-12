-- Create cycles table to track each payout cycle
CREATE TABLE public.cycles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  cycle_number INTEGER NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  payout_date TIMESTAMPTZ,
  payout_recipient_id UUID NOT NULL REFERENCES public.members(id),
  payout_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, cycle_number),
  CHECK (payout_status IN ('pending', 'ready', 'sent', 'completed'))
);

-- Enable RLS on cycles
ALTER TABLE public.cycles ENABLE ROW LEVEL SECURITY;

-- Users can view cycles for groups they're in
CREATE POLICY "Users can view cycles in their groups"
ON public.cycles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = cycles.group_id
    AND (
      groups.host_id = auth.uid()
      OR is_approved_group_member(groups.id, auth.uid())
    )
  )
);

-- Hosts can create cycles
CREATE POLICY "Hosts can create cycles"
ON public.cycles
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = cycles.group_id
    AND groups.host_id = auth.uid()
  )
);

-- Hosts can update cycles
CREATE POLICY "Hosts can update cycles"
ON public.cycles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.groups
    WHERE groups.id = cycles.group_id
    AND groups.host_id = auth.uid()
  )
);

-- Add updated_at trigger to cycles
CREATE TRIGGER update_cycles_updated_at
BEFORE UPDATE ON public.cycles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update contributions table to add status and payment_date
ALTER TABLE public.contributions 
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS contribution_status TEXT DEFAULT 'paid';

-- Add check constraint for contribution_status
ALTER TABLE public.contributions
DROP CONSTRAINT IF EXISTS contributions_contribution_status_check;

ALTER TABLE public.contributions
ADD CONSTRAINT contributions_contribution_status_check
CHECK (contribution_status IN ('pending', 'paid', 'late', 'waived'));