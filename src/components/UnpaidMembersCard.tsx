import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { getCurrentCycle, getDueDateForCycle, getDaysUntilDue, getDueDateLabel } from "@/lib/dateUtils";

interface UnpaidMember {
  id: string;
  name: string;
  email: string;
}

interface UnpaidMembersCardProps {
  unpaidMembers: UnpaidMember[];
  groupData: {
    start_date: string | null;
    frequency: string;
    grace_period_days: number;
  };
}

const UnpaidMembersCard = ({ unpaidMembers, groupData }: UnpaidMembersCardProps) => {
  // Don't show anything if no unpaid members
  if (unpaidMembers.length === 0) return null;

  // If Ajor hasn't started, show waiting message
  if (!groupData.start_date) {
    return (
      <Card className="shadow-[var(--shadow-medium)] border-blue-500/50 bg-blue-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Ajor Not Started</CardTitle>
          </div>
          <CardDescription>
            Start the Ajor to begin tracking contributions
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const currentCycle = getCurrentCycle(groupData.start_date, groupData.frequency);
  
  // If Ajor hasn't started yet (before start date)
  if (currentCycle === null) {
    const startDate = new Date(groupData.start_date);
    const daysUntilStart = Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return (
      <Card className="shadow-[var(--shadow-medium)] border-blue-500/50 bg-blue-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Ajor Starts Soon</CardTitle>
          </div>
          <CardDescription>
            First contributions will be due {daysUntilStart} day{daysUntilStart !== 1 ? 's' : ''} after start date ({startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const dueDate = getDueDateForCycle(groupData.start_date, groupData.frequency, currentCycle);
  const daysUntilDue = getDaysUntilDue(dueDate);
  const gracePeriodDays = groupData.grace_period_days || 3;

  const isOverdue = daysUntilDue < 0;
  const isDueToday = daysUntilDue === 0;
  const daysOverdue = isOverdue ? Math.abs(daysUntilDue) : 0;
  const isWithinGracePeriod = daysOverdue > 0 && daysOverdue <= gracePeriodDays;
  const isPastGracePeriod = daysOverdue > gracePeriodDays;
  const daysRemainingInGrace = isWithinGracePeriod ? gracePeriodDays - daysOverdue : 0;

  return (
    <Card className={`shadow-[var(--shadow-medium)] ${
      isPastGracePeriod 
        ? 'border-destructive/50 bg-destructive/5' 
        : isOverdue 
          ? 'border-warning/50 bg-warning/5'
          : 'border-warning/50'
    }`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {isPastGracePeriod ? (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          ) : (
            <AlertCircle className="h-5 w-5 text-warning" />
          )}
          <CardTitle className="text-lg">
            {isPastGracePeriod ? 'Overdue Contributions' : 'Unpaid Contributions'}
          </CardTitle>
        </div>
        <CardDescription>
          {isPastGracePeriod ? (
            <span className="text-destructive font-medium flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Grace period ended ({daysOverdue} days overdue)
            </span>
          ) : isWithinGracePeriod ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue · {daysRemainingInGrace} day{daysRemainingInGrace !== 1 ? 's' : ''} remaining in grace period
            </span>
          ) : isDueToday ? (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Due today · {gracePeriodDays}-day grace period available
            </span>
          ) : (
            <span className="flex items-center gap-1">
              {getDueDateLabel(dueDate)}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {unpaidMembers.map((member) => (
            <div 
              key={member.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                isPastGracePeriod 
                  ? 'bg-destructive/10 border-destructive/20' 
                  : 'bg-warning/10 border-warning/20'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{member.name}</p>
                <p className="text-sm text-muted-foreground truncate">{member.email}</p>
              </div>
              <div className="ml-4 flex-shrink-0">
                {isPastGracePeriod ? (
                  <Badge variant="destructive">
                    {daysOverdue}d overdue
                  </Badge>
                ) : isWithinGracePeriod ? (
                  <Badge variant="outline" className="border-warning text-warning">
                    {daysRemainingInGrace}d grace
                  </Badge>
                ) : isDueToday ? (
                  <Badge variant="outline" className="border-warning text-warning">
                    Due today
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-muted-foreground/50">
                    {getDueDateLabel(dueDate)}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
          <Clock className="h-3 w-3" />
          Late payment policy: {gracePeriodDays}-day grace period from due date
        </p>
      </CardContent>
    </Card>
  );
};

export default UnpaidMembersCard;
