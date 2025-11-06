import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Calendar, DollarSign, Users, Clock, CheckCircle, Plus } from "lucide-react";

const MemberDashboard = () => {
  const navigate = useNavigate();
  const [groupData, setGroupData] = useState<any>(null);
  const [memberData, setMemberData] = useState<any>(null);
  const [contributions, setContributions] = useState<any[]>([]);

  useEffect(() => {
    const storedGroup = sessionStorage.getItem("currentGroup");
    const storedMember = sessionStorage.getItem("currentMember");
    
    if (storedGroup && storedMember) {
      setGroupData(JSON.parse(storedGroup));
      setMemberData(JSON.parse(storedMember));
    } else {
      navigate("/join-group");
    }
  }, [navigate]);

  useEffect(() => {
    const storedContributions = sessionStorage.getItem("contributions");
    if (storedContributions) {
      setContributions(JSON.parse(storedContributions));
    }
  }, []);

  if (!groupData || !memberData) {
    return null;
  }

  const totalAmount = parseFloat(groupData.contributionAmount) * parseInt(groupData.numberOfMembers);
  const nextPayoutDate = new Date(groupData.nextPayoutDate);
  const memberPosition = groupData.currentMembers + 1;
  const cyclesUntilPayout = memberPosition - 1;

  // Calculate member's contribution progress
  const memberContributions = contributions.filter(c => c.memberId === memberData?.id);
  const totalPaid = memberContributions.reduce((sum, c) => sum + c.amount, 0);
  const expectedContributions = 3; // Show 3 cycles for demo
  const contributionProgress = (memberContributions.length / expectedContributions) * 100;

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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{groupData.groupName}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">{groupData.description}</p>
        </div>

        {/* Welcome Banner */}
        <div className="mb-8 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/20 border border-primary/20">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <CheckCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Welcome to the group! 🎉</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                Your first contribution of ${groupData.contributionAmount} is due on{" "}
                <span className="font-semibold text-foreground">
                  {nextPayoutDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">Your Contributions</CardTitle>
                <CardDescription className="text-sm">Track your payment status and history</CardDescription>
              </div>
              <Button onClick={() => navigate("/record-contribution")} size="sm" className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Contribution
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Contribution Progress</span>
                <span className="text-muted-foreground">
                  {memberContributions.length} of {expectedContributions} cycles
                </span>
              </div>
              <Progress value={contributionProgress} className="h-3" />
              <p className="text-sm text-muted-foreground">
                Total paid: ${totalPaid.toFixed(2)}
              </p>
            </div>

            {/* Contribution History */}
            {memberContributions.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cycle</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {memberContributions.map((contribution) => (
                        <TableRow key={contribution.id}>
                          <TableCell className="font-medium">{contribution.cycleLabel}</TableCell>
                          <TableCell>${contribution.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            {new Date(contribution.date).toLocaleDateString("en-US", { 
                              month: "short", 
                              day: "numeric",
                              year: "numeric"
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-green-600">
                              {contribution.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {memberContributions.map((contribution) => (
                    <div key={contribution.id} className="p-4 border rounded-lg space-y-2 bg-secondary/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{contribution.cycleLabel}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(contribution.date).toLocaleDateString("en-US", { 
                              month: "short", 
                              day: "numeric",
                              year: "numeric"
                            })}
                          </p>
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          {contribution.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">${contribution.amount.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4 text-sm sm:text-base">No contributions recorded yet</p>
                <Button onClick={() => navigate("/record-contribution")} variant="outline" className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Record Your First Contribution
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Members & Rotation */}
        <Card className="shadow-[var(--shadow-medium)]">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Payout Rotation Order</CardTitle>
            <CardDescription className="text-sm">
              Members receive ${totalAmount} when it's their turn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allMembers.map((member, index) => (
                <div
                  key={member.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg transition-all ${
                    member.id === memberData.id
                      ? "bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30"
                      : "bg-secondary/50 hover:bg-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-sm font-bold shrink-0">
                      #{member.position}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                      {member.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">
                        {member.name}
                        {member.id === memberData.id && (
                          <span className="ml-2 text-xs sm:text-sm text-primary font-semibold">(You)</span>
                        )}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
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
