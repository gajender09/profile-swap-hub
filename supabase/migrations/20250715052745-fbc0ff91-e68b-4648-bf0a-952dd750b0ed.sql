-- Fix the infinite recursion in user_roles policy by creating a security definer function
-- Drop the problematic policy first
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

-- Create a security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles 
    WHERE user_roles.user_id = $1 
    AND role = 'admin'
  );
$$;

-- Recreate the policy using the security definer function
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Also fix the announcements policy that might have the same issue
DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;

CREATE POLICY "Admins can manage announcements" 
ON public.announcements 
FOR ALL 
USING (public.is_admin(auth.uid()));

-- Fix admin_actions policy
DROP POLICY IF EXISTS "Admins can view all admin actions" ON public.admin_actions;
DROP POLICY IF EXISTS "Admins can create admin actions" ON public.admin_actions;

CREATE POLICY "Admins can view all admin actions" 
ON public.admin_actions 
FOR SELECT 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can create admin actions" 
ON public.admin_actions 
FOR INSERT 
WITH CHECK (public.is_admin(auth.uid()));

-- Fix banned_users policy
DROP POLICY IF EXISTS "Admins can manage banned users" ON public.banned_users;
DROP POLICY IF EXISTS "Admins can view all banned users" ON public.banned_users;

CREATE POLICY "Admins can manage banned users" 
ON public.banned_users 
FOR ALL 
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can view all banned users" 
ON public.banned_users 
FOR SELECT 
USING (public.is_admin(auth.uid()));