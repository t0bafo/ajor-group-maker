import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClockIcon, CheckCircle2, XCircle, Mail, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import ApprovalModal from "./ApprovalModal";

interface PendingRequest {
  id: string;
  name: string;
  email: string;
  requested_at: string;
  join_message?: string;
}

interface PendingRequestsCardProps {
  requests: PendingRequest[];
  onApprove: (memberId: string, welcomeMessage?: string) => Promise<void>;
  onReject: (memberId: string, reason: string) => Promise<void>;
}

const PendingRequestsCard = ({ requests, onApprove, onReject }: PendingRequestsCardProps) => {
  const [selectedRequest, setSelectedRequest] = useState<PendingRequest | null>(null);
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | null>(null);

  if (requests.length === 0) {
    return null;
  }

  const handleOpenModal = (request: PendingRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setModalAction(action);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setModalAction(null);
  };

  const handleConfirm = async (data: { message?: string; reason?: string }) => {
    if (!selectedRequest) return;

    if (modalAction === 'approve') {
      await onApprove(selectedRequest.id, data.message);
    } else if (modalAction === 'reject') {
      await onReject(selectedRequest.id, data.reason || 'No reason provided');
    }

    handleCloseModal();
  };

  return (
    <>
      <Card className="border-primary/20 shadow-[var(--shadow-elegant)] bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Pending Join Requests</CardTitle>
            </div>
            <Badge className="bg-primary/20 text-primary border-primary/30">
              {requests.length} {requests.length === 1 ? 'request' : 'requests'}
            </Badge>
          </div>
          <CardDescription>
            Review and approve members who want to join your group
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="p-4 rounded-lg border border-border bg-background/50 space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{request.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      Pending
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span>{request.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Requested {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>

              {request.join_message && (
                <div className="bg-muted/50 rounded p-3 border border-border">
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Message:</p>
                  <p className="text-sm">{request.join_message}</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 bg-emerald hover:bg-emerald/90"
                  onClick={() => handleOpenModal(request, 'approve')}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={() => handleOpenModal(request, 'reject')}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedRequest && modalAction && (
        <ApprovalModal
          open={!!selectedRequest}
          onOpenChange={handleCloseModal}
          action={modalAction}
          memberName={selectedRequest.name}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

export default PendingRequestsCard;
