import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";

interface PendingRequest {
  id: string;
  groupName: string;
  requestedAt: string;
  contributionAmount: number;
  frequency: string;
}

interface PendingJoinRequestsCardProps {
  requests: PendingRequest[];
}

const PendingJoinRequestsCard = ({ requests }: PendingJoinRequestsCardProps) => {
  if (requests.length === 0) return null;

  return (
    <Card className="shadow-[var(--shadow-medium)] border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <CardTitle className="text-xl">Pending Join Requests</CardTitle>
        </div>
        <CardDescription>
          Waiting for host approval
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map((request) => (
          <div 
            key={request.id}
            className="flex items-start justify-between p-4 rounded-lg bg-background border border-border/50"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">{request.groupName}</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                ${request.contributionAmount} / {request.frequency}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Requested {new Date(request.requestedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                })}
              </p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              Pending
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PendingJoinRequestsCard;
