
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SkillCard } from "@/components/SkillCard";
import { SwapRequestModal } from "@/components/SwapRequestModal";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HomePageProps {
  currentUser: any;
  profiles: any[];
  onSendRequest: (request: any) => void;
}

export function HomePage({ currentUser, profiles, onSendRequest }: HomePageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const itemsPerPage = 6;

  const filteredProfiles = profiles.filter(profile => {
    if (!profile.isPublic) return false;
    
    const matchesSearch = profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.skillsOffered.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      profile.skillsWanted.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAvailability = availabilityFilter === 'all' || profile.availability === availabilityFilter;
    
    return matchesSearch && matchesAvailability;
  });

  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentProfiles = filteredProfiles.slice(startIndex, startIndex + itemsPerPage);

  const handleRequestSwap = (profileId: string) => {
    if (!currentUser) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to request skill swaps.",
        variant: "destructive",
      });
      return;
    }

    const profile = profiles.find(p => p.id === profileId);
    setSelectedProfile(profile);
    setIsModalOpen(true);
  };

  const handleSendRequest = (request: any) => {
    onSendRequest(request);
    toast({
      title: "Request sent!",
      description: "Your skill swap request has been sent successfully.",
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, availabilityFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Discover & Share Skills
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with others to exchange knowledge and learn new skills through peer-to-peer teaching
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Availability</SelectItem>
                <SelectItem value="weekdays">Weekdays</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
                <SelectItem value="evenings">Evenings</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {currentProfiles.length} of {filteredProfiles.length} profiles
          </p>
        </div>

        {/* Profile Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {currentProfiles.map((profile) => (
            <SkillCard
              key={profile.id}
              profile={profile}
              onRequest={handleRequestSwap}
              showRequestButton={!!currentUser && profile.id !== currentUser?.id}
            />
          ))}
        </div>

        {currentProfiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No profiles found matching your criteria.</p>
            <p className="text-gray-400 mt-2">Try adjusting your search or filters.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-10"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}

        {/* Swap Request Modal */}
        <SwapRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          targetProfile={selectedProfile}
          currentUserSkills={currentUser?.skillsOffered || []}
          onSubmit={handleSendRequest}
        />
      </div>
    </div>
  );
}
