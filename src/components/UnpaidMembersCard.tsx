import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock } from "lucide-react";
import { getDaysOverdue, getCurrentCycle, getDueDateForCycle } from "@/lib/dateUtils";

interface UnpaidMember {
  id: string;
  name: string;
  email: string;
}

interface UnpaidMembersCardProps {
  unpaidMembers: UnpaidMember[];
  groupData: {
    start_date: string;
    frequency: string;
    grace_period_days: number;
  };
}

const UnpaidMembersCard = ({ unpaidMembers, groupData }: UnpaidMembersCardProps) => {
  if (unpaidMembers.length === 0) return null;

  const currentCycle = getCurrentCycle(groupData.start_date, groupData.frequency);
  const dueDate = getDueDateForCycle(groupData.start_date, groupData.frequency, currentCycle);
  const daysOverdue = getDaysOverdue(dueDate);
  const gracePeriodDays = groupData.grace_period_days || 3;
  const daysRemainingInGrace = gracePeriodDays - daysOverdue;

  const isWithinGracePeriod = daysOverdue >= 0 && daysOverdue <= gracePeriodDays;
  const isPastGracePeriod = daysOverdue > gracePeriodDays;

  return (
    <Card className="shadow-[var(--shadow-medium)] border-warning/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-warning" />
          <CardTitle className="text-lg">Unpaid Contributions</CardTitle>
        </div>
        <CardDescription>
          {isWithinGracePeriod ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {daysOverdue === 0 ? "Due today" : `${daysOverdue} day(s) overdue`} · {daysRemainingInGrace} day(s) remaining in grace period
            </span>
          ) : isPastGracePeriod ? (
            <span className="text-destructive font-medium">
              Grace period ended ({daysOverdue} days overdue)
            </span>
          ) : (
            <span>Payments due soon</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {unpaidMembers.map((member) => (
            <div 
              key={member.id}
              className="flex items-center justify-between p-3 bg-warning/10 border border-warning/20 rounded-lg"
            >
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.email}</p>
              </div>
              {isPastGracePeriod ? (
                <Badge variant="destructive">
                  Overdue
                </Badge>
              ) : isWithinGracePeriod && daysOverdue > 0 ? (
                <Badge variant="outline" className="border-warning text-warning">
                  {daysRemainingInGrace}d left
                </Badge>
              ) : (
                <Badge variant="outline" className="border-warning text-warning">
                  Due today
                </Badge>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          💡 Late payment policy: {gracePeriodDays}-day grace period from due date
        </p>
      </CardContent>
    </Card>
  );
};

export default UnpaidMembersCard;
