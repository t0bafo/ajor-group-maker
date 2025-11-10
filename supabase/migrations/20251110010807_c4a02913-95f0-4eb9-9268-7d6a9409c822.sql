-- Add late payment tracking to contributions table
ALTER TABLE public.contributions 
ADD COLUMN paid_at timestamp with time zone DEFAULT now(),
ADD COLUMN is_late boolean DEFAULT false,
ADD COLUMN due_date timestamp with time zone;

-- Update existing contributions to have paid_at set to created_at
UPDATE public.contributions 
SET paid_at = created_at 
WHERE paid_at IS NULL;

-- Add grace_period_days to groups table (default 3 days)
ALTER TABLE public.groups 
ADD COLUMN grace_period_days integer DEFAULT 3;