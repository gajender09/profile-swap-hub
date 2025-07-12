
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/ProfileForm";
import { MapPin, Clock, Edit, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ProfilePageProps {
  currentUser: any;
  onUpdateProfile: (profile: any) => void;
}

export function ProfilePage({ currentUser, onUpdateProfile }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = (updatedProfile: any) => {
    onUpdateProfile(updatedProfile);
    setIsEditing(false);
    toast({
      title: "Profile updated!",
      description: "Your profile has been saved successfully.",
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <ProfileForm
            profile={currentUser}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader className="pb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
                  <AvatarFallback className="text-2xl">
                    {currentUser.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">{currentUser.name}</h1>
                  <div className="flex items-center text-gray-600 mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{currentUser.location || 'Location not set'}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="capitalize">{currentUser.availability}</span>
                  </div>
                  <div className="flex items-center mt-2">
                    {currentUser.is_public ? (
                      <div className="flex items-center text-green-600">
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="text-sm">Public Profile</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-600">
                        <EyeOff className="h-4 w-4 mr-1" />
                        <span className="text-sm">Private Profile</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-green-700 mb-3">Skills I Can Teach</h3>
              {(currentUser.skills_offered?.length || 0) > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentUser.skills_offered.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No skills added yet. Click "Edit Profile" to add skills you can teach.</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-blue-700 mb-3">Skills I Want to Learn</h3>
              {(currentUser.skills_wanted?.length || 0) > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {currentUser.skills_wanted.map((skill: string, index: number) => (
                    <Badge key={index} variant="outline" className="border-blue-200 text-blue-800">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No skills added yet. Click "Edit Profile" to add skills you want to learn.</p>
              )}
            </div>

            {(!(currentUser.skills_offered?.length || 0) && !(currentUser.skills_wanted?.length || 0)) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-800 mb-2">Complete your profile to start skill swapping!</p>
                <p className="text-blue-600 text-sm">Add skills you can teach and skills you want to learn to connect with others.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
