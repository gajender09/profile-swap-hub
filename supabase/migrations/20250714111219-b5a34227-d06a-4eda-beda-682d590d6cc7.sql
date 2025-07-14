-- Insert some sample public profiles for demo purposes
INSERT INTO public.profiles (user_id, name, location, skills_offered, skills_wanted, availability, is_public) VALUES
('00000000-0000-0000-0000-000000000001', 'Sarah Chen', 'San Francisco, CA', ARRAY['Python', 'Data Science', 'Machine Learning'], ARRAY['React', 'UI Design'], 'weekends', true),
('00000000-0000-0000-0000-000000000002', 'Mike Johnson', 'New York, NY', ARRAY['React', 'JavaScript', 'Node.js'], ARRAY['Python', 'DevOps'], 'evenings', true),
('00000000-0000-0000-0000-000000000003', 'Lisa Rodriguez', 'Austin, TX', ARRAY['UI Design', 'Figma', 'Adobe Creative Suite'], ARRAY['Vue.js', 'Animation'], 'flexible', true),
('00000000-0000-0000-0000-000000000004', 'David Kim', 'Seattle, WA', ARRAY['Java', 'Spring Boot', 'System Design'], ARRAY['Cloud Architecture', 'Kubernetes'], 'weekdays', true),
('00000000-0000-0000-0000-000000000005', 'Emma Wilson', 'Chicago, IL', ARRAY['Marketing', 'Content Writing', 'SEO'], ARRAY['Web Analytics', 'Social Media'], 'weekends', true),
('00000000-0000-0000-0000-000000000006', 'Alex Thompson', 'Boston, MA', ARRAY['DevOps', 'Docker', 'AWS'], ARRAY['Machine Learning', 'Data Engineering'], 'evenings', true);

-- Update RLS policies to be more permissive for better user experience
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Anyone can view public profiles" 
ON public.profiles 
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON public.profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_skills ON public.profiles USING GIN(skills_offered);
CREATE INDEX IF NOT EXISTS idx_swap_requests_users ON public.swap_requests(from_user_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_swap_requests_status ON public.swap_requests(status);