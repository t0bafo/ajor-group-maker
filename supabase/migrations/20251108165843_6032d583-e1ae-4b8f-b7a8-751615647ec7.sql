-- Add archived field to groups table
ALTER TABLE public.groups 
ADD COLUMN archived BOOLEAN NOT NULL DEFAULT false;

-- Add index for better query performance
CREATE INDEX idx_groups_archived ON public.groups(archived);

-- Add index for filtering active groups by host
CREATE INDEX idx_groups_host_archived ON public.groups(host_id, archived);