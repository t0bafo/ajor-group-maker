import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, DollarSign, Users, Settings, UserPlus, CheckCircle2 } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";

const GroupDashboard = () => {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [groupData, setGroupData] = useState<any>({});
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    const storedGroup = sessionStorage.getItem("ajorGroup");
    const storedMembers = sessionStorage.getItem("ajorMembers");
    
    if (storedGroup) setGroupData(JSON.parse(storedGroup));
    if (storedMembers) setMembers(JSON.parse(storedMembers));
  }, []);

  const totalAmount = parseFloat(groupData.contributionAmount || 0) * parseInt(groupData.numberOfMembers || 0);
  const currentProgress = (members.length / parseInt(groupData.numberOfMembers || 1)) * 100;
  
  const nextPayoutDate = new Date();
  if (groupData.frequency === "weekly") nextPayoutDate.setDate(nextPayoutDate.getDate() + 7);
  else if (groupData.frequency === "biweekly") nextPayoutDate.setDate(nextPayoutDate.getDate() + 14);
  else nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-8 md:py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="mb-2 -ml-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-3xl md:text-4xl font-bold">{groupData.groupName || "Your Ajor Group"}</h1>
            <p className="text-muted-foreground mt-1">{groupData.description}</p>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Contribution Amount
              </CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${groupData.contributionAmount || 0}</div>
              <p className="text-sm text-muted-foreground mt-1 capitalize">
                {groupData.frequency || "—"} per member
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Next Payout
              </CardTitle>
              <Calendar className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {nextPayoutDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                ${totalAmount || 0} total payout
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Members
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {members.length}/{groupData.numberOfMembers || 0}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Active participants
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Tracker */}
        <Card className="shadow-[var(--shadow-medium)] mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Group Setup Progress</CardTitle>
            <CardDescription>Complete your group setup to start saving</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Members Added</span>
                <span className="text-muted-foreground">
                  {members.length} of {groupData.numberOfMembers}
                </span>
              </div>
              <Progress value={currentProgress} className="h-3" />
            </div>
            
            {members.length < parseInt(groupData.numberOfMembers || 0) && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/invite")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invite More Members
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Members List & Rotation Order */}
        <Card className="shadow-[var(--shadow-medium)]">
          <CardHeader>
            <CardTitle className="text-xl">Member List & Payout Order</CardTitle>
            <CardDescription>
              Rotation order: {groupData.rotationOrder === "sequential" ? "Sequential" : "Random"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                      {member.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === "Host" ? "default" : "outline"}>
                      {member.role}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {members.length < parseInt(groupData.numberOfMembers || 0) && (
              <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Contributions will begin once all {groupData.numberOfMembers} members have joined.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmationModal 
        open={showConfirmation} 
        onOpenChange={setShowConfirmation}
        groupData={groupData}
        members={members}
      />
    </div>
  );
};

export default GroupDashboard;
