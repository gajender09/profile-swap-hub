import { useState } from "react";
import { Search, Filter, MapPin, Clock, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: any) => void;
  availableSkills: string[];
}

export function SearchFilters({ onSearch, onFilterChange, availableSkills }: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');
  const [minRating, setMinRating] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = () => {
    onFilterChange({
      skills: selectedSkills,
      location,
      availability,
      minRating: minRating ? parseFloat(minRating) : undefined
    });
  };

  const addSkillFilter = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      const newSkills = [...selectedSkills, skill];
      setSelectedSkills(newSkills);
      setTimeout(handleFilterChange, 0);
    }
  };

  const removeSkillFilter = (skill: string) => {
    const newSkills = selectedSkills.filter(s => s !== skill);
    setSelectedSkills(newSkills);
    setTimeout(handleFilterChange, 0);
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setLocation('');
    setAvailability('');
    setMinRating('');
    onFilterChange({});
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              placeholder="Search for skills, people, or keywords..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Quick Skill Tags */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">Popular skills:</span>
            {availableSkills.slice(0, 8).map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => addSkillFilter(skill)}
              >
                {skill}
              </Badge>
            ))}
          </div>

          {/* Advanced Filters */}
          <Collapsible open={showFilters} onOpenChange={setShowFilters}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Advanced Filters'}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Location
                  </label>
                  <Input
                    placeholder="City or region..."
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setTimeout(handleFilterChange, 300);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    Availability
                  </label>
                  <Select value={availability} onValueChange={(value) => {
                    setAvailability(value);
                    setTimeout(handleFilterChange, 0);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any time</SelectItem>
                      <SelectItem value="weekdays">Weekdays</SelectItem>
                      <SelectItem value="weekends">Weekends</SelectItem>
                      <SelectItem value="evenings">Evenings</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    Min Rating
                  </label>
                  <Select value={minRating} onValueChange={(value) => {
                    setMinRating(value);
                    setTimeout(handleFilterChange, 0);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any rating</SelectItem>
                      <SelectItem value="4">4+ stars</SelectItem>
                      <SelectItem value="3">3+ stars</SelectItem>
                      <SelectItem value="2">2+ stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Selected Skills */}
              {selectedSkills.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selected Skills:</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => removeSkillFilter(skill)}
                      >
                        {skill} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={clearFilters}>
                  Clear All Filters
                </Button>
                <div className="text-sm text-muted-foreground">
                  {selectedSkills.length > 0 || location || availability || minRating
                    ? `${selectedSkills.length + (location ? 1 : 0) + (availability ? 1 : 0) + (minRating ? 1 : 0)} filter(s) applied`
                    : 'No filters applied'
                  }
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  );
}