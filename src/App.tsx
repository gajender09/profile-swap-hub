
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
import NotFound from "./pages/NotFound";

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
  const [currentUser, setCurrentUser] = useState(null);
  const [profiles, setProfiles] = useState(mockProfiles);
  const [requests, setRequests] = useState([]);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    // Add user to profiles if not exists
    if (!profiles.find(p => p.id === user.id)) {
      setProfiles(prev => [...prev, user]);
    }
  };

  const handleRegister = (user: any) => {
    setCurrentUser(user);
    setProfiles(prev => [...prev, user]);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleUpdateProfile = (updatedProfile: any) => {
    setCurrentUser(prev => ({ ...prev, ...updatedProfile }));
    setProfiles(prev => prev.map(p => 
      p.id === currentUser?.id ? { ...p, ...updatedProfile } : p
    ));
  };

  const handleSendRequest = (request: any) => {
    const newRequest = {
      id: Date.now().toString(),
      fromUserId: currentUser?.id,
      fromUserName: currentUser?.name,
      fromUserAvatar: currentUser?.avatar,
      toUserId: request.targetUserId,
      toUserName: request.targetUserName,
      toUserAvatar: profiles.find(p => p.id === request.targetUserId)?.avatar,
      mySkill: request.mySkill,
      theirSkill: request.theirSkill,
      message: request.message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    setRequests(prev => [...prev, newRequest]);
  };

  const handleUpdateRequest = (requestId: string, status: string) => {
    setRequests(prev => prev.map(request => 
      request.id === requestId ? { ...request, status } : request
    ));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Header currentUser={currentUser} onLogout={handleLogout} />
            <Routes>
              <Route 
                path="/" 
                element={
                  <HomePage 
                    currentUser={currentUser}
                    profiles={profiles}
                    onSendRequest={handleSendRequest}
                  />
                } 
              />
              <Route 
                path="/login" 
                element={<LoginPage onLogin={handleLogin} />} 
              />
              <Route 
                path="/register" 
                element={<RegisterPage onRegister={handleRegister} />} 
              />
              <Route 
                path="/profile" 
                element={
                  <ProfilePage 
                    currentUser={currentUser}
                    onUpdateProfile={handleUpdateProfile}
                  />
                } 
              />
              <Route 
                path="/requests" 
                element={
                  <RequestsPage 
                    currentUser={currentUser}
                    requests={requests}
                    onUpdateRequest={handleUpdateRequest}
                  />
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
