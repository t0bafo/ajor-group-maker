import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, DollarSign, Users, Settings, UserPlus, Plus, TrendingUp } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";
import AppNavigation from "@/components/AppNavigation";
import { supabase } from "@/integrations/supabase/client";

const GroupDashboard = () => {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(true);
  const [groupData, setGroupData] = useState<any>({});
  const [members, setMembers] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const storedGroup = sessionStorage.getItem("ajorGroup");
    const storedMembers = sessionStorage.getItem("ajorMembers");
    const storedContributions = sessionStorage.getItem("contributions");
    const storedPayouts = sessionStorage.getItem("payouts");
    
    if (storedGroup) setGroupData(JSON.parse(storedGroup));
    if (storedMembers) setMembers(JSON.parse(storedMembers));
    if (storedContributions) setContributions(JSON.parse(storedContributions));
    if (storedPayouts) setPayouts(JSON.parse(storedPayouts));
  }, []);

  const totalAmount = parseFloat(groupData.contributionAmount || 0) * parseInt(groupData.numberOfMembers || 0);
  const currentProgress = (members.length / parseInt(groupData.numberOfMembers || 1)) * 100;
  
  const nextPayoutDate = new Date();
  if (groupData.frequency === "weekly") nextPayoutDate.setDate(nextPayoutDate.getDate() + 7);
  else if (groupData.frequency === "biweekly") nextPayoutDate.setDate(nextPayoutDate.getDate() + 14);
  else nextPayoutDate.setMonth(nextPayoutDate.getMonth() + 1);

  // Calculate contribution stats
  const totalCollected = contributions.reduce((sum, c) => sum + c.amount, 0);
  const expectedPerCycle = parseFloat(groupData.contributionAmount || 0) * members.length;
  const contributionProgress = expectedPerCycle > 0 ? (totalCollected / expectedPerCycle) * 100 : 0;

  // Calculate payout stats
  const totalPayouts = payouts.length;
  const payoutProgress = members.length > 0 ? (totalPayouts / members.length) * 100 : 0;

  // Get member contribution status
  const getMemberStatus = (memberId: string) => {
    const memberContributions = contributions.filter(c => c.memberId === memberId);
    return memberContributions.length > 0 ? "Paid" : "Pending";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <AppNavigation 
        userEmail={user?.email} 
        userName={user?.user_metadata?.full_name}
      />
      
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
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
                Payout Progress
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPayouts}</div>
              <p className="text-sm text-muted-foreground mt-1">
                of {members.length} payouts made
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

        {/* Payout Tracking Card */}
        <Card className="shadow-[var(--shadow-medium)] mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Payout Tracking</CardTitle>
                <CardDescription>Monitor payout completion and rotation progress</CardDescription>
              </div>
              <Button onClick={() => navigate("/payout-management")} size="sm">
                Manage Payouts
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Cycle Progress</span>
                <span className="text-muted-foreground">
                  {totalPayouts} of {members.length} members paid
                </span>
              </div>
              <Progress value={payoutProgress} className="h-3" />
            </div>

            {payoutProgress === 100 ? (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                  ✅ Cycle Complete! All members have received their payouts.
                </p>
              </div>
            ) : totalPayouts > 0 ? (
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Next:</strong> {members.length - totalPayouts} member(s) remaining to receive payouts
                </p>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p className="mb-4">No payouts recorded yet</p>
                <Button onClick={() => navigate("/payout-management")} variant="outline" size="sm">
                  Start Recording Payouts
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-medium)] mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Contribution Ledger</CardTitle>
                <CardDescription>Track all member contributions for this cycle</CardDescription>
              </div>
              <Button onClick={() => navigate("/record-contribution")} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Record Contribution
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Current Cycle Progress</span>
                <span className="text-muted-foreground">
                  ${totalCollected.toFixed(2)} of ${expectedPerCycle.toFixed(2)}
                </span>
              </div>
              <Progress value={contributionProgress} className="h-3" />
            </div>

            {/* Contribution Table */}
            {contributions.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Cycle</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contributions.map((contribution) => (
                      <TableRow key={contribution.id}>
                        <TableCell className="font-medium">{contribution.memberName}</TableCell>
                        <TableCell>{contribution.cycleLabel}</TableCell>
                        <TableCell>${contribution.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          {new Date(contribution.date).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric" 
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
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">No contributions recorded yet</p>
                <Button onClick={() => navigate("/record-contribution")} variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Record First Contribution
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Group Setup Progress */}
        {members.length < parseInt(groupData.numberOfMembers || 0) && (
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
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/invite-members")}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Invite More Members
              </Button>
            </CardContent>
          </Card>
        )}

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
                    <Badge 
                      variant={getMemberStatus(member.id) === "Paid" ? "default" : "outline"}
                      className={getMemberStatus(member.id) === "Paid" ? "bg-green-600" : ""}
                    >
                      {getMemberStatus(member.id)}
                    </Badge>
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
