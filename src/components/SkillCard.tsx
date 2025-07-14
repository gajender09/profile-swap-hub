import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, Star, Users, MessageSquare, TrendingUp } from "lucide-react";
import { SwapRequestModal } from "./SwapRequestModal";

interface SkillCardProps {
  profile: {
    user_id: string;
    name: string;
    location?: string;
    avatar_url?: string;
    skills_offered: string[];
    skills_wanted: string[];
    availability: string;
    average_rating?: number;
    total_ratings?: number;
    total_swaps?: number;
  };
  currentUser?: any;
  onSendRequest: (request: any) => void;
}

export function SkillCard({ profile, currentUser, onSendRequest }: SkillCardProps) {
  const [showRequestModal, setShowRequestModal] = useState(false);

  const isOwnProfile = currentUser?.user_id === profile.user_id;
  const currentUserSkills = currentUser?.skills_offered || [];

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'weekdays':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'weekends':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'evenings':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100';
      case 'flexible':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-3 w-3 ${
          index < Math.floor(rating)
            ? 'fill-yellow-400 text-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950/50">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 ring-2 ring-primary/10">
                <AvatarImage src={profile.avatar_url} alt={profile.name} />
                <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/20 to-secondary/20">
                  {profile.name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-foreground truncate">
                  {profile.name}
                </h3>
                {profile.location && (
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm truncate">{profile.location}</span>
                  </div>
                )}
                
                {/* Rating and Stats */}
                <div className="flex items-center space-x-4 mt-2">
                  {(profile.average_rating && profile.average_rating > 0) ? (
                    <div className="flex items-center space-x-1">
                      <div className="flex">
                        {renderStars(profile.average_rating)}
                      </div>
                      <span className="text-sm font-medium">
                        {profile.average_rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({profile.total_ratings} reviews)
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground">No ratings yet</span>
                  )}
                  
                  {profile.total_swaps && profile.total_swaps > 0 && (
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span className="text-xs">{profile.total_swaps} swaps</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <Badge className={getAvailabilityColor(profile.availability)} variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              {profile.availability}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Skills Offered */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-green-700 dark:text-green-400 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Can Teach
              </h4>
              <span className="text-xs text-muted-foreground">
                {profile.skills_offered?.length || 0} skills
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills_offered?.map((skill) => (
                <Badge 
                  key={skill} 
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Skills Wanted */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-blue-700 dark:text-blue-400 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Wants to Learn
              </h4>
              <span className="text-xs text-muted-foreground">
                {profile.skills_wanted?.length || 0} skills
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills_wanted?.map((skill) => (
                <Badge 
                  key={skill} 
                  variant="outline"
                  className="border-blue-200 text-blue-800 dark:border-blue-800 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Action Button */}
          {!isOwnProfile && currentUser && (
            <Button 
              onClick={() => setShowRequestModal(true)}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={currentUserSkills.length === 0}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Request Skill Swap
            </Button>
          )}
          
          {isOwnProfile && (
            <div className="text-center py-3">
              <Badge variant="outline" className="border-dashed">
                This is your profile
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Request Modal */}
      <SwapRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        targetProfile={profile}
        currentUserSkills={currentUserSkills}
        onSubmit={onSendRequest}
      />
    </>
  );
}