import { useState, useMemo } from "react";
import { SkillCard } from "@/components/SkillCard";
import { SearchFilters } from "@/components/SearchFilters";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, TrendingUp, Star, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface HomePageProps {
  currentUser: any;
  profiles: any[];
  requests?: any[];
  onSendRequest: (request: any) => void;
}

export function HomePage({ currentUser, profiles, requests = [], onSendRequest }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});

  // Get all unique skills for search filters
  const availableSkills = useMemo(() => {
    const skillsSet = new Set<string>();
    profiles.forEach(profile => {
      profile.skills_offered?.forEach((skill: string) => skillsSet.add(skill));
      profile.skills_wanted?.forEach((skill: string) => skillsSet.add(skill));
    });
    return Array.from(skillsSet).sort();
  }, [profiles]);

  // Filter profiles based on search and filters
  const filteredProfiles = useMemo(() => {
    return profiles.filter(profile => {
      // Text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const nameMatch = profile.name?.toLowerCase().includes(query);
        const locationMatch = profile.location?.toLowerCase().includes(query);
        const skillsMatch = [
          ...(profile.skills_offered || []),
          ...(profile.skills_wanted || [])
        ].some(skill => skill.toLowerCase().includes(query));
        
        if (!nameMatch && !locationMatch && !skillsMatch) {
          return false;
        }
      }

      // Skills filter
      if (filters.skills?.length > 0) {
        const hasMatchingSkills = filters.skills.some((skill: string) =>
          profile.skills_offered?.includes(skill) || profile.skills_wanted?.includes(skill)
        );
        if (!hasMatchingSkills) return false;
      }

      // Location filter
      if (filters.location) {
        if (!profile.location?.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
      }

      // Availability filter
      if (filters.availability && profile.availability !== filters.availability) {
        return false;
      }

      // Rating filter
      if (filters.minRating && (profile.average_rating || 0) < filters.minRating) {
        return false;
      }

      return true;
    });
  }, [profiles, searchQuery, filters]);

  const stats = useMemo(() => {
    return {
      totalUsers: profiles.length,
      totalSkills: availableSkills.length,
      avgRating: profiles.reduce((sum, p) => sum + (p.average_rating || 0), 0) / Math.max(profiles.length, 1),
      totalSwaps: profiles.reduce((sum, p) => sum + (p.total_swaps || 0), 0)
    };
  }, [profiles, availableSkills]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-blue-950">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-full shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
            Skill Swap Network
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Connect with fellow learners, share your expertise, and master new skills through collaborative learning.
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalUsers}</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Active Users</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-0">
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalSkills}</div>
                <div className="text-sm text-green-700 dark:text-green-300">Available Skills</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900 border-0">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                  {stats.avgRating.toFixed(1)}
                </div>
                <div className="text-sm text-yellow-700 dark:text-yellow-300">Avg Rating</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-0">
              <CardContent className="p-4 text-center">
                <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{stats.totalSwaps}</div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Completed Swaps</div>
              </CardContent>
            </Card>
          </div>

          {!currentUser && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold mb-2">Ready to start learning?</h3>
              <p className="text-muted-foreground mb-4">
                Join our community of learners and start swapping skills today!
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild className="bg-gradient-to-r from-primary to-secondary">
                  <a href="/register">
                    Join Now <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/login">Sign In</a>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Announcements */}
        <AnnouncementBanner />

        {/* Search and Filters */}
        <SearchFilters
          onSearch={setSearchQuery}
          onFilterChange={setFilters}
          availableSkills={availableSkills}
        />

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold">
              {searchQuery || Object.keys(filters).length > 0 ? 'Search Results' : 'All Profiles'}
            </h2>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {filteredProfiles.length} {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
            </Badge>
          </div>
          
          {(searchQuery || Object.keys(filters).length > 0) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setFilters({});
              }}
            >
              Clear Search
            </Button>
          )}
        </div>

        {/* Profiles Grid */}
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <SkillCard
                key={profile.user_id}
                profile={profile}
                currentUser={currentUser}
                requests={requests}
                onSendRequest={onSendRequest}
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No profiles found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || Object.keys(filters).length > 0
                  ? "Try adjusting your search criteria or filters."
                  : "No public profiles are available yet."}
              </p>
              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setFilters({});
                  }}
                >
                  Show All Profiles
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}