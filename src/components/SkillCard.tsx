
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock } from "lucide-react";

interface SkillCardProps {
  profile: {
    id: string;
    name: string;
    location: string;
    avatar: string;
    skillsOffered: string[];
    skillsWanted: string[];
    availability: string;
    isPublic: boolean;
  };
  onRequest: (profileId: string) => void;
  showRequestButton: boolean;
}

export function SkillCard({ profile, onRequest, showRequestButton }: SkillCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar} alt={profile.name} />
            <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{profile.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-3 w-3 mr-1" />
              <span className="truncate">{profile.location}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-green-700 mb-2">Skills Offered</h4>
          <div className="flex flex-wrap gap-1">
            {profile.skillsOffered.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-green-100 text-green-800">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-blue-700 mb-2">Skills Wanted</h4>
          <div className="flex flex-wrap gap-1">
            {profile.skillsWanted.map((skill, index) => (
              <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-800">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <span>{profile.availability}</span>
        </div>
      </CardContent>

      {showRequestButton && (
        <CardFooter>
          <Button 
            onClick={() => onRequest(profile.id)} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Request Swap
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
