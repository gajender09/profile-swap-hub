
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "@/components/Header";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RequestsPage } from "@/pages/RequestsPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';

const queryClient = new QueryClient();

// Mock data
const mockProfiles = [
  {
    id: '1',
    name: 'Sarah Chen',
    location: 'San Francisco, CA',
    avatar: '',
    skillsOffered: ['Python', 'Data Science', 'Machine Learning'],
    skillsWanted: ['React', 'UI Design'],
    availability: 'weekends',
    isPublic: true,
  },
  {
    id: '2',
    name: 'Mike Johnson',
    location: 'New York, NY',
    avatar: '',
    skillsOffered: ['React', 'JavaScript', 'Node.js'],
    skillsWanted: ['Python', 'DevOps'],
    availability: 'evenings',
    isPublic: true,
  },
  {
    id: '3',
    name: 'Lisa Rodriguez',
    location: 'Austin, TX',
    avatar: '',
    skillsOffered: ['UI Design', 'Figma', 'Adobe Creative Suite'],
    skillsWanted: ['Vue.js', 'Animation'],
    availability: 'flexible',
    isPublic: true,
  },
  {
    id: '4',
    name: 'David Kim',
    location: 'Seattle, WA',
    avatar: '',
    skillsOffered: ['Java', 'Spring Boot', 'System Design'],
    skillsWanted: ['Cloud Architecture', 'Kubernetes'],
    availability: 'weekdays',
    isPublic: true,
  },
  {
    id: '5',
    name: 'Emma Wilson',
    location: 'Chicago, IL',
    avatar: '',
    skillsOffered: ['Marketing', 'Content Writing', 'SEO'],
    skillsWanted: ['Web Analytics', 'Social Media'],
    availability: 'weekends',
    isPublic: true,
  },
  {
    id: '6',
    name: 'Alex Thompson',
    location: 'Boston, MA',
    avatar: '',
    skillsOffered: ['DevOps', 'Docker', 'AWS'],
    skillsWanted: ['Machine Learning', 'Data Engineering'],
    availability: 'evenings',
    isPublic: true,
  },
];

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile when logged in
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            setUserProfile(profile);
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true);
      
      if (data) {
        setProfiles(data);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateProfile = async (updatedProfile: any) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update(updatedProfile)
      .eq('user_id', user.id);

    if (!error) {
      setUserProfile(prev => ({ ...prev, ...updatedProfile }));
      setProfiles(prev => prev.map(p => 
        p.user_id === user.id ? { ...p, ...updatedProfile } : p
      ));
    }
  };

  const handleSendRequest = async (request: any) => {
    if (!user) return;

    const newRequest = {
      from_user_id: user.id,
      to_user_id: request.targetUserId,
      my_skill: request.mySkill,
      their_skill: request.theirSkill,
      message: request.message,
    };
    
    const { error } = await supabase
      .from('swap_requests')
      .insert([newRequest]);

    if (!error) {
      // Refresh requests
      const { data } = await supabase
        .from('swap_requests')
        .select(`
          *,
          from_profile:profiles!swap_requests_from_user_id_fkey(*),
          to_profile:profiles!swap_requests_to_user_id_fkey(*)
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);
      
      if (data) setRequests(data);
    }
  };

  const handleUpdateRequest = async (requestId: string, status: string) => {
    const { error } = await supabase
      .from('swap_requests')
      .update({ status })
      .eq('id', requestId);

    if (!error) {
      setRequests(prev => prev.map(request => 
        request.id === requestId ? { ...request, status } : request
      ));
    }
  };

  // Fetch user requests
  useEffect(() => {
    if (user) {
      const fetchRequests = async () => {
        const { data } = await supabase
          .from('swap_requests')
          .select(`
            *,
            from_profile:profiles!swap_requests_from_user_id_fkey(*),
            to_profile:profiles!swap_requests_to_user_id_fkey(*)
          `)
          .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);
        
        if (data) setRequests(data);
      };

      fetchRequests();
    }
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Header currentUser={userProfile} onLogout={handleLogout} />
            <Routes>
              <Route 
                path="/" 
                element={
                  <HomePage 
                    currentUser={userProfile}
                    profiles={profiles}
                    onSendRequest={handleSendRequest}
                  />
                } 
              />
              <Route 
                path="/login" 
                element={<LoginPage />} 
              />
              <Route 
                path="/register" 
                element={<RegisterPage />} 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage 
                      currentUser={userProfile}
                      onUpdateProfile={handleUpdateProfile}
                    />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/requests" 
                element={
                  <ProtectedRoute>
                    <RequestsPage 
                      currentUser={userProfile}
                      requests={requests}
                      onUpdateRequest={handleUpdateRequest}
                    />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
