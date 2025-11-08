-- Add RLS policy to rate_limit table to explicitly deny public access
-- This table is only accessed by edge functions using service role key
CREATE POLICY "No public access to rate_limit"
ON public.rate_limit
FOR ALL
USING (false);