
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Check, X, MessageSquare } from "lucide-react";

interface RequestCardProps {
  request: {
    id: string;
    fromUserId: string;
    fromUserName: string;
    fromUserAvatar?: string;
    toUserId: string;
    toUserName: string;
    toUserAvatar?: string;
    mySkill: string;
    theirSkill: string;
    message: string;
    status: 'pending' | 'accepted' | 'rejected';
    createdAt: string;
  };
  currentUserId: string;
  onAccept?: (requestId: string) => void;
  onReject?: (requestId: string) => void;
}

export function RequestCard({ request, currentUserId, onAccept, onReject }: RequestCardProps) {
  const isReceiver = request.toUserId === currentUserId;
  const otherUser = isReceiver 
    ? { name: request.fromUserName, avatar: request.fromUserAvatar }
    : { name: request.toUserName, avatar: request.toUserAvatar };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
              <AvatarFallback>{otherUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{otherUser.name}</p>
              <p className="text-sm text-muted-foreground">
                {new Date(request.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(request.status)}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-700 font-medium">
                {isReceiver ? 'They teach:' : 'I teach:'}
              </span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {isReceiver ? request.mySkill : request.theirSkill}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700 font-medium">
                {isReceiver ? 'You teach:' : 'They teach:'}
              </span>
              <Badge variant="outline" className="border-blue-200 text-blue-800">
                {isReceiver ? request.theirSkill : request.mySkill}
              </Badge>
            </div>
          </div>
        </div>

        {request.message && (
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-900">{request.message}</p>
            </div>
          </div>
        )}

        {isReceiver && request.status === 'pending' && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => onAccept?.(request.id)}
            >
              <Check className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => onReject?.(request.id)}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
