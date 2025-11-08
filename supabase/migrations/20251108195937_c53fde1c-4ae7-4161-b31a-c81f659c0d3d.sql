-- Add start_date to groups table for tracking official Ajor start
ALTER TABLE public.groups 
ADD COLUMN start_date TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the field
COMMENT ON COLUMN public.groups.start_date IS 'Official start date when the Ajor begins. Used for payout calculations and cycle tracking.';