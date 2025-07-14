
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestCard } from "@/components/RequestCard";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface RequestsPageProps {
  currentUser: any;
  requests: any[];
  onUpdateRequest: (requestId: string, status: string) => void;
  onRateUser?: (swapRequestId: string, rating: number, feedback: string) => void;
  onDeleteRequest?: (requestId: string) => void;
}

export function RequestsPage({ currentUser, requests, onUpdateRequest, onRateUser, onDeleteRequest }: RequestsPageProps) {
  const [activeTab, setActiveTab] = useState('all');

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Please log in to view your requests.</p>
      </div>
    );
  }

  const userRequests = requests.filter(request => 
    request.from_user_id === currentUser.user_id || request.to_user_id === currentUser.user_id
  );

  const filteredRequests = userRequests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  const handleAcceptRequest = (requestId: string) => {
    onUpdateRequest(requestId, 'accepted');
    toast({
      title: "Request accepted!",
      description: "The skill swap request has been accepted.",
    });
  };

  const handleRejectRequest = (requestId: string) => {
    onUpdateRequest(requestId, 'rejected');
    toast({
      title: "Request rejected",
      description: "The skill swap request has been rejected.",
    });
  };

  const getTabCounts = () => {
    return {
      all: userRequests.length,
      pending: userRequests.filter(r => r.status === 'pending').length,
      accepted: userRequests.filter(r => r.status === 'accepted').length,
      rejected: userRequests.filter(r => r.status === 'rejected').length,
    };
  };

  const counts = getTabCounts();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Skill Swap Requests</h1>
          <p className="text-gray-600">Manage your incoming and outgoing skill swap requests</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="relative">
              <MessageSquare className="h-4 w-4 mr-2" />
              All
              {counts.all > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {counts.all}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              <Clock className="h-4 w-4 mr-2" />
              Pending
              {counts.pending > 0 && (
                <Badge variant="default" className="ml-2 text-xs bg-yellow-500">
                  {counts.pending}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted" className="relative">
              <Check className="h-4 w-4 mr-2" />
              Accepted
              {counts.accepted > 0 && (
                <Badge variant="default" className="ml-2 text-xs bg-green-500">
                  {counts.accepted}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="rejected" className="relative">
              <X className="h-4 w-4 mr-2" />
              Rejected
              {counts.rejected > 0 && (
                <Badge variant="default" className="ml-2 text-xs bg-red-500">
                  {counts.rejected}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {['all', 'pending', 'accepted', 'rejected'].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="space-y-4">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => {
                    // Transform request data to match RequestCard interface
                    const transformedRequest = {
                      id: request.id,
                      fromUserId: request.from_user_id,
                      fromUserName: request.from_profile?.name || 'Unknown User',
                      fromUserAvatar: request.from_profile?.avatar_url || '',
                      toUserId: request.to_user_id,
                      toUserName: request.to_profile?.name || 'Unknown User',
                      toUserAvatar: request.to_profile?.avatar_url || '',
                      mySkill: request.my_skill,
                      theirSkill: request.their_skill,
                      message: request.message || '',
                      status: request.status,
                      createdAt: request.created_at,
                    };

                    return (
                      <RequestCard
                        key={request.id}
                        request={transformedRequest}
                        currentUserId={currentUser.user_id}
                        onAccept={handleAcceptRequest}
                        onReject={handleRejectRequest}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">
                      {tab === 'all' ? 'No requests yet' : `No ${tab} requests`}
                    </p>
                    <p className="text-gray-400 mt-2">
                      {tab === 'all' 
                        ? 'Start browsing profiles to send skill swap requests!' 
                        : `You don't have any ${tab} requests at the moment.`
                      }
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
