-- Create user_roles table for admin functionality
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Create swap_ratings table for feedback system
CREATE TABLE public.swap_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  swap_request_id UUID NOT NULL REFERENCES public.swap_requests(id) ON DELETE CASCADE,
  rater_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(swap_request_id, rater_user_id)
);

-- Create admin_actions table for tracking admin activities
CREATE TABLE public.admin_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('ban_user', 'unban_user', 'reject_skill', 'moderate_content', 'send_announcement')),
  target_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create announcements table for platform-wide messages
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create banned_users table
CREATE TABLE public.banned_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  banned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT,
  banned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Add average_rating column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_swaps INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swap_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- RLS Policies for swap_ratings
CREATE POLICY "Users can view ratings for their swaps" 
ON public.swap_ratings 
FOR SELECT 
USING (auth.uid() = rater_user_id OR auth.uid() = rated_user_id);

CREATE POLICY "Users can create ratings for their completed swaps" 
ON public.swap_ratings 
FOR INSERT 
WITH CHECK (
  auth.uid() = rater_user_id AND
  EXISTS (
    SELECT 1 FROM public.swap_requests sr 
    WHERE sr.id = swap_request_id 
    AND sr.status = 'accepted'
    AND (sr.from_user_id = auth.uid() OR sr.to_user_id = auth.uid())
  )
);

-- RLS Policies for admin_actions
CREATE POLICY "Admins can view all admin actions" 
ON public.admin_actions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Admins can create admin actions" 
ON public.admin_actions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'moderator')
  )
);

-- RLS Policies for announcements
CREATE POLICY "Everyone can view active announcements" 
ON public.announcements 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage announcements" 
ON public.announcements 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

-- RLS Policies for banned_users
CREATE POLICY "Admins can view all banned users" 
ON public.banned_users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Admins can manage banned users" 
ON public.banned_users 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role IN ('admin', 'moderator')
  )
);

-- Function to update profile ratings
CREATE OR REPLACE FUNCTION public.update_profile_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the rated user's profile with new average rating
  UPDATE public.profiles 
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating::decimal), 0) 
      FROM public.swap_ratings 
      WHERE rated_user_id = NEW.rated_user_id
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.swap_ratings 
      WHERE rated_user_id = NEW.rated_user_id
    ),
    updated_at = now()
  WHERE user_id = NEW.rated_user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update ratings automatically
CREATE TRIGGER update_profile_rating_trigger
  AFTER INSERT ON public.swap_ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_rating();

-- Function to increment swap count
CREATE OR REPLACE FUNCTION public.increment_swap_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment when status changes to accepted
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    -- Increment for both users
    UPDATE public.profiles 
    SET 
      total_swaps = total_swaps + 1,
      updated_at = now()
    WHERE user_id IN (NEW.from_user_id, NEW.to_user_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment swap count
CREATE TRIGGER increment_swap_count_trigger
  AFTER UPDATE ON public.swap_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_swap_count();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_swap_ratings_swap_request_id ON public.swap_ratings(swap_request_id);
CREATE INDEX IF NOT EXISTS idx_swap_ratings_rated_user_id ON public.swap_ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_user_id ON public.admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON public.admin_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON public.announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_banned_users_user_id ON public.banned_users(user_id);

-- Insert default admin user (replace with actual user ID when available)
-- This will need to be updated with actual user IDs after registration