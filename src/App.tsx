
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
      setLoading(true);
      
      // Check if request already exists
      const { data: existingRequest } = await supabase
        .from('swap_requests')
        .select('id')
        .eq('from_user_id', user.id)
        .eq('to_user_id', request.targetUserId)
        .eq('my_skill', request.mySkill)
        .eq('their_skill', request.theirSkill)
        .eq('status', 'pending')
        .single();

      if (existingRequest) {
        toast({
          title: "Request already exists",
          description: "You've already sent a similar request to this user.",
          variant: "destructive"
        });
        return;
      }

      const newRequest = {
        from_user_id: user.id,
        to_user_id: request.targetUserId,
        my_skill: request.mySkill,
        their_skill: request.theirSkill,
        message: request.message?.trim() || null,
        status: 'pending'
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
      console.error('Error sending request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (requestId: string, status: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('swap_requests')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('to_user_id', user.id); // Only allow updates by the recipient

      if (error) {
        throw error;
      }

      // Update local state immediately for better UX
      setRequests(prev => prev.map(request => 
        request.id === requestId ? { ...request, status } : request
      ));

      toast({
        title: status === 'accepted' ? "Request accepted!" : "Request rejected",
        description: `You have ${status} the skill swap request.`
      });
    } catch (error: any) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update request.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch user requests
  const fetchUserRequests = async () => {
    if (!user) return;

    try {
      // Fetch requests with profile information
      const { data: requestsData, error: requestsError } = await supabase
        .from('swap_requests')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (requestsError) throw requestsError;

      // Get all unique user IDs from requests
      const userIds = new Set<string>();
      requestsData?.forEach(request => {
        userIds.add(request.from_user_id);
        userIds.add(request.to_user_id);
      });

      // Fetch profiles for all users involved in requests
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', Array.from(userIds));

      if (profilesError) throw profilesError;

      // Create a map of user profiles
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });
      
      // Transform the data to match the expected format
      const transformedRequests = requestsData?.map(request => {
        const fromProfile = profilesMap.get(request.from_user_id);
        const toProfile = profilesMap.get(request.to_user_id);
        
        return {
          id: request.id,
          fromUserId: request.from_user_id,
          fromUserName: fromProfile?.name || 'Unknown User',
          fromUserAvatar: fromProfile?.avatar_url,
          toUserId: request.to_user_id,
          toUserName: toProfile?.name || 'Unknown User', 
          toUserAvatar: toProfile?.avatar_url,
          mySkill: request.my_skill,
          theirSkill: request.their_skill,
          message: request.message,
          status: request.status,
          createdAt: request.created_at
        };
      }) || [];

      setRequests(transformedRequests);
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
        .channel('swap_requests_changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'swap_requests'
        }, (payload) => {
          console.log('Request change:', payload);
          // Only refetch if the change involves the current user
          const newRecord = payload.new as any;
          const oldRecord = payload.old as any;
          const record = newRecord || oldRecord;
          
          if (record && (record.from_user_id === user.id || record.to_user_id === user.id)) {
            fetchUserRequests();
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(requestsChannel);
      };
    } else {
      setRequests([]);
    }
  }, [user]);

  // Add rating and delete request handlers
  const handleRateUser = async (swapRequestId: string, rating: number, feedback: string) => {
    if (!user) return;
    
    try {
      const swapRequest = requests.find(r => r.id === swapRequestId);
      if (!swapRequest) return;
      
      const ratedUserId = swapRequest.fromUserId === user.id 
        ? swapRequest.toUserId 
        : swapRequest.fromUserId;

      const { error } = await supabase
        .from('swap_ratings')
        .insert({
          swap_request_id: swapRequestId,
          rater_user_id: user.id,
          rated_user_id: ratedUserId,
          rating,
          feedback: feedback.trim() || null
        });

      if (error) throw error;
      
      toast({
        title: "Rating submitted!",
        description: "Thank you for your feedback."
      });
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating",
        variant: "destructive"
      });
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('swap_requests')
        .delete()
        .eq('id', requestId)
        .eq('from_user_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      
      // Remove from local state
      setRequests(prev => prev.filter(r => r.id !== requestId));
      
      toast({
        title: "Request deleted",
        description: "Your request has been deleted."
      });
    } catch (error: any) {
      console.error('Error deleting request:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete request",
        variant: "destructive"
      });
    }
  };

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
                      onRateUser={handleRateUser}
                      onDeleteRequest={handleDeleteRequest}
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
