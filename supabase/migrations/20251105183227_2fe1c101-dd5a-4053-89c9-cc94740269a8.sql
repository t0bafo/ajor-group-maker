-- Create groups table
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  description TEXT,
  contribution_amount DECIMAL(10, 2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
  number_of_members INTEGER NOT NULL CHECK (number_of_members >= 2 AND number_of_members <= 20),
  rotation_order TEXT NOT NULL CHECK (rotation_order IN ('sequential', 'random')),
  invite_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create members table
CREATE TABLE public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Host', 'Member')),
  position INTEGER,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create contributions table
CREATE TABLE public.contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  cycle INTEGER NOT NULL,
  cycle_label TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payouts table
CREATE TABLE public.payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  cycle INTEGER NOT NULL,
  payout_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for groups
CREATE POLICY "Users can view groups they are host of"
  ON public.groups FOR SELECT
  USING (auth.uid() = host_id);

CREATE POLICY "Users can view groups they are members of"
  ON public.groups FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE members.group_id = groups.id
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create groups"
  ON public.groups FOR INSERT
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their groups"
  ON public.groups FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their groups"
  ON public.groups FOR DELETE
  USING (auth.uid() = host_id);

-- RLS Policies for members
CREATE POLICY "Users can view members of their groups"
  ON public.members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = members.group_id
      AND (groups.host_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.members m2
        WHERE m2.group_id = groups.id
        AND m2.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Hosts can add members to their groups"
  ON public.members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = group_id
      AND groups.host_id = auth.uid()
    )
  );

CREATE POLICY "Users can add themselves to groups via invite"
  ON public.members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for contributions
CREATE POLICY "Users can view contributions in their groups"
  ON public.contributions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = contributions.group_id
      AND (groups.host_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.members
        WHERE members.group_id = groups.id
        AND members.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Members can create contributions"
  ON public.contributions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.members
      WHERE members.id = member_id
      AND (members.user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.groups
        WHERE groups.id = group_id
        AND groups.host_id = auth.uid()
      ))
    )
  );

-- RLS Policies for payouts
CREATE POLICY "Users can view payouts in their groups"
  ON public.payouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = payouts.group_id
      AND (groups.host_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.members
        WHERE members.group_id = groups.id
        AND members.user_id = auth.uid()
      ))
    )
  );

CREATE POLICY "Hosts can create payouts"
  ON public.payouts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups
      WHERE groups.id = group_id
      AND groups.host_id = auth.uid()
    )
  );

-- Create function to generate unique invite code
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..9 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for groups updated_at
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();