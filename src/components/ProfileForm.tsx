
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Plus, Loader2 } from "lucide-react";

interface ProfileFormProps {
  profile: any;
  onSave: (profile: any) => void;
  onCancel: () => void;
}

export function ProfileForm({ profile, onSave, onCancel }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    location: profile?.location || '',
    availability: profile?.availability || 'flexible',
    is_public: profile?.is_public ?? true,
    skills_offered: profile?.skills_offered || [],
    skills_wanted: profile?.skills_wanted || [],
  });

  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');

  const addSkillOffered = () => {
    if (newSkillOffered.trim()) {
      setFormData(prev => ({
        ...prev,
        skills_offered: [...prev.skills_offered, newSkillOffered.trim()]
      }));
      setNewSkillOffered('');
    }
  };

  const addSkillWanted = () => {
    if (newSkillWanted.trim()) {
      setFormData(prev => ({
        ...prev,
        skills_wanted: [...prev.skills_wanted, newSkillWanted.trim()]
      }));
      setNewSkillWanted('');
    }
  };

  const removeSkillOffered = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills_offered: prev.skills_offered.filter((_, i) => i !== index)
    }));
  };

  const removeSkillWanted = (index: number) => {
    setFormData(prev => ({
      ...prev,
      skills_wanted: prev.skills_wanted.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Availability</Label>
            <Select 
              value={formData.availability} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, availability: value }))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekdays">Weekdays</SelectItem>
                <SelectItem value="weekends">Weekends</SelectItem>
                <SelectItem value="evenings">Evenings</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="public"
              checked={formData.is_public}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_public: checked }))}
              disabled={loading}
            />
            <Label htmlFor="public">Make profile public</Label>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Skills Offered</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a skill you can teach"
                  value={newSkillOffered}
                  onChange={(e) => setNewSkillOffered(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillOffered())}
                  disabled={loading}
                />
                <Button type="button" size="icon" onClick={addSkillOffered} disabled={loading}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills_offered.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkillOffered(index)}
                      className="ml-1 hover:text-red-600"
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>Skills Wanted</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  placeholder="Add a skill you want to learn"
                  value={newSkillWanted}
                  onChange={(e) => setNewSkillWanted(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkillWanted())}
                  disabled={loading}
                />
                <Button type="button" size="icon" onClick={addSkillWanted} disabled={loading}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.skills_wanted.map((skill, index) => (
                  <Badge key={index} variant="outline" className="border-blue-200 text-blue-800">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkillWanted(index)}
                      className="ml-1 hover:text-red-600"
                      disabled={loading}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1" disabled={loading}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
}
