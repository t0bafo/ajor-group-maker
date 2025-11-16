import { format } from "date-fns";
import { Calendar, Edit2, User, TrendingUp, CheckCircle2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CycleCardProps {
  cycle: {
    id: string;
    cycle_number: number;
    start_date: string;
    end_date: string;
    payout_date: string | null;
    payout_status: string;
    group_name: string;
    payout_recipient: {
      id: string;
      name: string;
      email: string;
    };
  };
  contributions: Array<{
    member_id: string;
    member_name: string;
    amount: number;
    contribution_status: string;
    payment_date: string | null;
  }>;
  expectedAmount: number;
  isHost: boolean;
  onPayoutDateUpdated?: () => void;
}

export const CycleCard = ({
  cycle,
  contributions,
  expectedAmount,
  isHost,
  onPayoutDateUpdated,
}: CycleCardProps) => {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    cycle.payout_date ? new Date(cycle.payout_date) : undefined
  );

  const paidContributions = contributions.filter((c) => c.contribution_status === "paid");
  const totalCollected = paidContributions.reduce((sum, c) => sum + c.amount, 0);
  // Expected amount is (N-1) * expectedAmount since payout recipient doesn't contribute
  const progress = expectedAmount > 0 ? (totalCollected / expectedAmount) * 100 : 0;

  const getStatusBadge = () => {
    if (cycle.payout_status === "completed") {
      return <Badge className="bg-green-500">Complete</Badge>;
    }
    if (progress >= 100) {
      return <Badge className="bg-primary">Ready</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const handleSavePayoutDate = async () => {
    if (!selectedDate) return;

    const cycleStart = new Date(cycle.start_date);
    const cycleEnd = new Date(cycle.end_date);
    const oneWeekAfterEnd = new Date(cycleEnd);
    oneWeekAfterEnd.setDate(oneWeekAfterEnd.getDate() + 7);

    if (selectedDate < cycleStart || selectedDate > oneWeekAfterEnd) {
      toast.error("Payout date must be between cycle start and 1 week after cycle end");
      return;
    }

    const { error } = await supabase
      .from("cycles")
      .update({ payout_date: selectedDate.toISOString() })
      .eq("id", cycle.id);

    if (error) {
      toast.error("Failed to update payout date");
      console.error(error);
      return;
    }

    toast.success("Payout date updated");
    setIsEditingDate(false);
    onPayoutDateUpdated?.();

    // Send notification to payout recipient
    try {
      await supabase.functions.invoke("send-notification", {
        body: {
          type: "payout_date_set",
          recipientEmail: cycle.payout_recipient.email,
          data: {
            recipientName: cycle.payout_recipient.name,
            groupName: cycle.group_name,
            cycleNumber: cycle.cycle_number,
            payoutDate: selectedDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }),
            amount: expectedAmount,
          },
        },
      });
    } catch (notifError) {
      console.error("Failed to send notification:", notifError);
      // Don't show error to user since the payout date was updated successfully
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">
              Cycle {cycle.cycle_number}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {format(new Date(cycle.start_date), "MMM d")} -{" "}
              {format(new Date(cycle.end_date), "MMM d, yyyy")}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Payout Recipient */}
        <div className="flex items-center gap-3 p-3 bg-accent rounded-lg">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              {cycle.payout_recipient.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-sm font-medium">Payout Recipient</p>
            <p className="text-sm text-muted-foreground">{cycle.payout_recipient.name}</p>
          </div>
        </div>

        {/* Payout Date */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Payout Date</p>
              <p className="text-sm text-muted-foreground">
                {cycle.payout_date
                  ? format(new Date(cycle.payout_date), "MMM d, yyyy")
                  : "Not set"}
              </p>
            </div>
          </div>
          {isHost && cycle.payout_status !== "completed" && (
            <Popover open={isEditingDate} onOpenChange={setIsEditingDate}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Edit2 className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
                <div className="p-3 border-t flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingDate(false)}
                  >
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSavePayoutDate}>
                    Save
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Contribution Progress</span>
            <span className="font-medium">
              {paidContributions.length}/{contributions.length} members
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Amount Collected</span>
            <span className="font-medium">
              ${totalCollected.toFixed(2)} / ${expectedAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Members</p>
          <div className="space-y-1">
            {contributions.map((contribution) => (
              <div
                key={contribution.member_id}
                className="flex items-center justify-between p-2 rounded border"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full",
                      contribution.contribution_status === "paid" && "bg-green-500",
                      contribution.contribution_status === "pending" && "bg-muted",
                      contribution.contribution_status === "late" && "bg-red-500"
                    )}
                  />
                  <span className="text-sm">{contribution.member_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {contribution.contribution_status === "paid" && (
                    <>
                      <span className="text-xs text-muted-foreground">
                        {contribution.payment_date &&
                          format(new Date(contribution.payment_date), "MMM d")}
                      </span>
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </>
                  )}
                  {contribution.contribution_status === "pending" && (
                    <span className="text-xs text-muted-foreground">Pending</span>
                  )}
                  {contribution.contribution_status === "late" && (
                    <Badge variant="destructive" className="text-xs">
                      Late
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
