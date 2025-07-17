import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Rating } from "@/components/ui/rating"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, User } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface RatingModalProps {
  isOpen: boolean
  onClose: () => void
  swapRequest: any
  currentUser: any
  onRatingSubmitted?: () => void
}

export function RatingModal({
  isOpen,
  onClose,
  swapRequest,
  currentUser,
  onRatingSubmitted
}: RatingModalProps) {
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const ratedUser = swapRequest?.from_user_id === currentUser?.id 
    ? swapRequest?.to_profile 
    : swapRequest?.from_profile

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase
        .from('swap_ratings')
        .insert({
          swap_request_id: swapRequest.id,
          rater_user_id: currentUser.id,
          rated_user_id: ratedUser?.user_id,
          rating,
          feedback: feedback.trim() || null,
        })

      if (error) throw error

      toast({
        title: "Rating Submitted",
        description: "Thank you for your feedback!",
      })

      setRating(0)
      setFeedback("")
      onClose()
      onRatingSubmitted?.()
      
    } catch (error: any) {
      console.error('Error submitting rating:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!ratedUser) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Rate Your Experience
          </DialogTitle>
          <DialogDescription>
            Share your experience with this skill swap
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
            <Avatar className="h-12 w-12">
              <AvatarImage src={ratedUser.avatar_url} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{ratedUser.name}</p>
              <p className="text-sm text-muted-foreground">
                Skill: {swapRequest.their_skill}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rate this experience</label>
            <div className="flex justify-center">
              <Rating value={rating} onChange={setRating} size="lg" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Feedback (optional)</label>
            <Textarea
              placeholder="Share your thoughts..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}