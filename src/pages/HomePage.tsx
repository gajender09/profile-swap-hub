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
    <div className="min-h-screen bg-background">
      {/* Hero Section with Modern Gradient */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero opacity-5 dark:opacity-10"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="container mx-auto px-4 py-16 relative">
          {/* Hero Content */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <div className="absolute -inset-2 gradient-primary rounded-full blur-xl opacity-30 animate-glow"></div>
                <div className="relative bg-primary p-6 rounded-full shadow-xl">
                  <Sparkles className="h-10 w-10 text-primary-foreground" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight text-gradient animate-slide-down">
              Skill Swap Network
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 animate-slide-up">
              Connect with fellow learners, share your expertise, and master new skills through 
              <span className="text-primary font-semibold"> collaborative learning</span>.
            </p>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-16">
              <Card className="glass border-0 hover:shadow-glow transition-all duration-300 group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
                    <Users className="h-10 w-10 text-primary mx-auto relative z-10" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stats.totalUsers}</div>
                  <div className="text-sm font-medium text-muted-foreground">Active Learners</div>
                </CardContent>
              </Card>

              <Card className="glass border-0 hover:shadow-glow transition-all duration-300 group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-accent/20 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
                    <TrendingUp className="h-10 w-10 text-accent mx-auto relative z-10" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stats.totalSkills}</div>
                  <div className="text-sm font-medium text-muted-foreground">Unique Skills</div>
                </CardContent>
              </Card>

              <Card className="glass border-0 hover:shadow-glow transition-all duration-300 group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
                    <Star className="h-10 w-10 text-yellow-500 mx-auto relative z-10" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {stats.avgRating.toFixed(1)}
                  </div>
                  <div className="text-sm font-medium text-muted-foreground">Avg Rating</div>
                </CardContent>
              </Card>

              <Card className="glass border-0 hover:shadow-glow transition-all duration-300 group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-success/20 rounded-full blur-lg group-hover:blur-xl transition-all"></div>
                    <Zap className="h-10 w-10 text-success mx-auto relative z-10" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">{stats.totalSwaps}</div>
                  <div className="text-sm font-medium text-muted-foreground">Skill Swaps</div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section for Non-authenticated Users */}
            {!currentUser && (
              <div className="glass rounded-xl p-8 max-w-2xl mx-auto border border-primary/20">
                <div className="flex items-center justify-center mb-4">
                  <div className="h-1 w-16 gradient-primary rounded-full"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Ready to start your learning journey?</h3>
                <p className="text-muted-foreground mb-8 text-lg">
                  Join thousands of learners exchanging skills and growing together in our vibrant community.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="gradient" size="lg" asChild className="text-white">
                    <a href="/register">
                      Start Learning <ArrowRight className="h-5 w-5 ml-2" />
                    </a>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="/login">Sign In</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="container mx-auto px-4 pb-16">
        {/* Announcements */}
        <div className="mb-8">
          <AnnouncementBanner />
        </div>

        {/* Search and Filters Section */}
        <div className="mb-8">
          <SearchFilters
            onSearch={setSearchQuery}
            onFilterChange={setFilters}
            availableSkills={availableSkills}
          />
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="text-3xl font-bold">
              {searchQuery || Object.keys(filters).length > 0 ? 'Search Results' : 'Discover Talents'}
            </h2>
            <Badge variant="secondary" className="text-base px-4 py-2 font-medium">
              {filteredProfiles.length} {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
            </Badge>
          </div>

          {(searchQuery || Object.keys(filters).length > 0) && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setSearchQuery('');
                setFilters({});
              }}
              className="shrink-0"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Profiles Grid */}
        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProfiles.map((profile) => (
              <div key={profile.user_id} className="animate-fade-in">
                <SkillCard
                  profile={profile}
                  currentUser={currentUser}
                  requests={requests}
                  onSendRequest={onSendRequest}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="glass border-0 text-center py-20 animate-fade-in">
            <CardContent>
              <div className="text-8xl mb-6 opacity-50">🔍</div>
              <h3 className="text-2xl font-bold mb-4">No profiles found</h3>
              <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                {searchQuery || Object.keys(filters).length > 0
                  ? "Try adjusting your search criteria or filters to find more matches."
                  : "No public profiles are available yet. Be the first to share your skills!"}
              </p>
              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button
                  variant="gradient"
                  size="lg"
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