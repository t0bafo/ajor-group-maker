-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'member');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'
  )
$$;

-- Create admin activity log table
CREATE TABLE public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on admin_logs
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_created_at ON public.admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_target ON public.admin_logs(target_type, target_id);

-- RLS Policies for user_roles (admins can view all, users can view their own)
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles FOR DELETE
USING (public.is_admin(auth.uid()));

-- RLS Policies for admin_logs
CREATE POLICY "Admins can view admin logs"
ON public.admin_logs FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create logs"
ON public.admin_logs FOR INSERT
WITH CHECK (public.is_admin(auth.uid()) AND admin_id = auth.uid());

-- Update existing table policies to allow admin access

-- Groups: Admins can view all groups
CREATE POLICY "Admins can view all groups"
ON public.groups FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all groups"
ON public.groups FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Members: Admins can view all members
CREATE POLICY "Admins can view all members"
ON public.members FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all members"
ON public.members FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete all members"
ON public.members FOR DELETE
USING (public.is_admin(auth.uid()));

-- Contributions: Admins can do everything
CREATE POLICY "Admins can view all contributions"
ON public.contributions FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert contributions"
ON public.contributions FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update contributions"
ON public.contributions FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete contributions"
ON public.contributions FOR DELETE
USING (public.is_admin(auth.uid()));

-- Cycles: Admins can do everything
CREATE POLICY "Admins can view all cycles"
ON public.cycles FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all cycles"
ON public.cycles FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete cycles"
ON public.cycles FOR DELETE
USING (public.is_admin(auth.uid()));

-- Payouts: Admins can do everything
CREATE POLICY "Admins can view all payouts"
ON public.payouts FOR SELECT
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update payouts"
ON public.payouts FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete payouts"
ON public.payouts FOR DELETE
USING (public.is_admin(auth.uid()));

-- Set initial admin user (assist@tobiafo.com)
-- Note: This will be executed after migration approval
-- The user must exist in auth.users first
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'assist@tobiafo.com';
  
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;