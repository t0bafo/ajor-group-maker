-- Add payment_method column to contributions table
ALTER TABLE public.contributions 
ADD COLUMN payment_method text;

-- Update existing rows to have a default value if needed
UPDATE public.contributions 
SET payment_method = 'Other' 
WHERE payment_method IS NULL;