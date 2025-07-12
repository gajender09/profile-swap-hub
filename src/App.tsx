
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
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
import { LoadingScreen } from "@/components/LoadingScreen";
import NotFound from "./pages/NotFound";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from '@supabase/supabase-js';

const queryClient = new QueryClient();

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
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .maybeSingle();
            
            if (error) {
              console.error('Error fetching profile:', error);
            } else {
              setUserProfile(profile);
            }
          }, 0);
        } else {
          setUserProfile(null);
        }
      }
    );

    // Check for existing session and fetch profile
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle();
        setUserProfile(profile);
      }
    };

    initializeAuth();

    return () => subscription.unsubscribe();
  }, []);

  // Fetch profiles and set up real-time updates
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true);
      
      if (error) {
        console.error('Error fetching profiles:', error);
        toast({
          title: "Error",
          description: "Failed to load profiles. Please refresh the page.",
          variant: "destructive",
        });
      } else {
        setProfiles(data || []);
      }
      setLoading(false);
    };

    fetchProfiles();

    // Set up real-time updates for profiles
    const profilesChannel = supabase
      .channel('profiles_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'profiles'
      }, () => {
        fetchProfiles(); // Refetch when profiles change
      })
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUpdateProfile = async (updatedProfile: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setUserProfile(prev => ({ ...prev, ...updatedProfile }));
      setProfiles(prev => prev.map(p => 
        p.user_id === user.id ? { ...p, ...updatedProfile } : p
      ));

      toast({
        title: "Profile updated!",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
      throw error; // Re-throw to let the form handle it
    }
  };

  const handleSendRequest = async (request: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to send requests.",
        variant: "destructive",
      });
      return;
    }

    try {
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

      if (error) {
        throw error;
      }

      // Refresh requests
      await fetchUserRequests();

      toast({
        title: "Request sent!",
        description: "Your skill swap request has been sent successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send request.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateRequest = async (requestId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('swap_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) {
        throw error;
      }

      setRequests(prev => prev.map(request => 
        request.id === requestId ? { ...request, status } : request
      ));

      toast({
        title: `Request ${status}!`,
        description: `The skill swap request has been ${status}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update request.",
        variant: "destructive",
      });
    }
  };

  // Function to fetch user requests
  const fetchUserRequests = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          *,
          from_profile:profiles!swap_requests_from_user_id_fkey(*),
          to_profile:profiles!swap_requests_to_user_id_fkey(*)
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`);
      
      if (error) {
        throw error;
      }

      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load requests.",
        variant: "destructive",
      });
    }
  };

  // Fetch user requests and set up real-time updates
  useEffect(() => {
    if (user) {
      fetchUserRequests();

      // Set up real-time updates for requests
      const requestsChannel = supabase
        .channel('requests_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'swap_requests'
        }, () => {
          fetchUserRequests(); // Refetch when requests change
        })
        .subscribe();

      return () => {
        supabase.removeChannel(requestsChannel);
      };
    } else {
      setRequests([]);
    }
  }, [user]);

  if (loading) {
    return <LoadingScreen />;
  }

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
