
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile: any;
  currentUserSkills: string[];
  onSubmit: (request: any) => void;
}

export function SwapRequestModal({ isOpen, onClose, targetProfile, currentUserSkills, onSubmit }: SwapRequestModalProps) {
  const [mySkill, setMySkill] = useState('');
  const [theirSkill, setTheirSkill] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mySkill || !theirSkill) return;

    onSubmit({
      mySkill,
      theirSkill,
      message,
      targetUserId: targetProfile.id,
      targetUserName: targetProfile.name,
    });

    // Reset form
    setMySkill('');
    setTheirSkill('');
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Skill Swap</DialogTitle>
          <DialogDescription>
            Send a swap request to {targetProfile?.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="my-skill">I can teach:</Label>
            <Select value={mySkill} onValueChange={setMySkill}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill you offer" />
              </SelectTrigger>
              <SelectContent>
                {currentUserSkills.map((skill) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="their-skill">I want to learn:</Label>
            <Select value={theirSkill} onValueChange={setTheirSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Select a skill they offer" />
              </SelectTrigger>
              <SelectContent>
                {targetProfile?.skillsOffered?.map((skill: string) => (
                  <SelectItem key={skill} value={skill}>
                    {skill}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (optional):</Label>
            <Textarea
              id="message"
              placeholder="Introduce yourself and explain why you'd like to do this swap..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!mySkill || !theirSkill}>
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
