import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, DollarSign, Users, Clock, CheckCircle } from "lucide-react";

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState<any>(null);
  const [memberData, setMemberData] = useState<any>(null);

  useEffect(() => {
    const storedGroup = sessionStorage.getItem("currentGroup");
    const storedMember = sessionStorage.getItem("currentMember");
    
    if (storedGroup && storedMember) {
      setGroupData(JSON.parse(storedGroup));
      setMemberData(JSON.parse(storedMember));
    } else {
      navigate("/join");
    }
  }, [navigate]);

  if (!groupData || !memberData) {
    return null;
  }

  const totalAmount = parseFloat(groupData.contributionAmount) * parseInt(groupData.numberOfMembers);
  const nextPayoutDate = new Date(groupData.nextPayoutDate);
  const memberPosition = groupData.currentMembers + 1; // New member position
  const cyclesUntilPayout = memberPosition - 1;

  // Mock existing members
  const allMembers = [
    { id: 1, name: groupData.hostName, email: groupData.hostEmail, role: "Host", position: 1 },
    { id: 2, name: "Alex Thompson", email: "alex@example.com", role: "Member", position: 2 },
    { id: 3, name: "Jordan Lee", email: "jordan@example.com", role: "Member", position: 3 },
    { id: 4, name: "Taylor Swift", email: "taylor@example.com", role: "Member", position: 4 },
    { ...memberData, position: memberPosition },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-8 md:py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{groupData.groupName}</h1>
          <p className="text-muted-foreground">{groupData.description}</p>
        </div>

        {/* Welcome Banner */}
        <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/20 border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <CheckCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Welcome to the group! 🎉</h2>
              <p className="text-muted-foreground">
                Your first contribution of ${groupData.contributionAmount} is due on{" "}
                <span className="font-semibold text-foreground">
                  {nextPayoutDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Your Contribution
              </CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${groupData.contributionAmount}</div>
              <p className="text-sm text-muted-foreground mt-1 capitalize">
                Due {groupData.frequency}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Your Payout Position
              </CardTitle>
              <Clock className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">#{memberPosition}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {cyclesUntilPayout} cycles to wait
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Expected Payout
              </CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalAmount}</div>
              <p className="text-sm text-muted-foreground mt-1">
                When it's your turn
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contribution Tracker */}
        <Card className="shadow-[var(--shadow-medium)] mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Current Cycle Progress</CardTitle>
            <CardDescription>Track your contribution status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Next Contribution Due</span>
                <span className="text-muted-foreground">
                  {nextPayoutDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              <Progress value={0} className="h-3" />
              <p className="text-sm text-muted-foreground">
                No contributions recorded yet
              </p>
            </div>
            
            <Button variant="default" className="w-full" disabled>
              Record Contribution (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Members & Rotation */}
        <Card className="shadow-[var(--shadow-medium)]">
          <CardHeader>
            <CardTitle className="text-xl">Payout Rotation Order</CardTitle>
            <CardDescription>
              Members receive ${totalAmount} when it's their turn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allMembers.map((member, index) => (
                <div
                  key={member.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    member.id === memberData.id
                      ? "bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30"
                      : "bg-secondary/50 hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-sm font-bold">
                      #{member.position}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                      {member.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">
                        {member.name}
                        {member.id === memberData.id && (
                          <span className="ml-2 text-sm text-primary font-semibold">(You)</span>
                        )}
                      </p>
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

            <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-muted-foreground">
                <strong>Your Turn:</strong> You'll receive ${totalAmount} after {cyclesUntilPayout} other 
                members have received their payouts.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MemberDashboard;
