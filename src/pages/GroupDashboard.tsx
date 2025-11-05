import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, DollarSign, Users, Settings, UserPlus, Plus, TrendingUp } from "lucide-react";
import AppNavigation from "@/components/AppNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GroupDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

    // Load group data from database
    const loadGroupData = async () => {
      const groupId = sessionStorage.getItem("currentGroupId");
      if (!groupId) {
        toast({
          title: "No Group Selected",
          description: "Please select a group from your dashboard",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      try {
        // Fetch group data
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;

        // Fetch members
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .eq('group_id', groupId)
          .order('position');

        if (membersError) throw membersError;

        // Fetch contributions
        const { data: contributionsData, error: contributionsError } = await supabase
          .from('contributions')
          .select(`
            *,
            members(name)
          `)
          .eq('group_id', groupId)
          .order('created_at', { ascending: false });

        if (contributionsError) throw contributionsError;

        // Fetch payouts
        const { data: payoutsData, error: payoutsError } = await supabase
          .from('payouts')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: false });

        if (payoutsError) throw payoutsError;

        // Format data for display
        setGroupData({
          id: group.id,
          groupName: group.group_name,
          description: group.description,
          contributionAmount: group.contribution_amount,
          frequency: group.frequency,
          numberOfMembers: group.number_of_members,
          rotationOrder: group.rotation_order,
          inviteCode: group.invite_code,
        });

        setMembers(membersData.map((m: any) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          userId: m.user_id,
        })));

        setContributions(contributionsData.map((c: any) => ({
          id: c.id,
          memberId: c.member_id,
          memberName: c.members?.name || 'Unknown',
          amount: parseFloat(c.amount),
          cycle: c.cycle,
          cycleLabel: c.cycle_label,
          date: c.created_at,
          note: c.note,
          status: c.status,
        })));

        setPayouts(payoutsData.map((p: any) => ({
          id: p.id,
          memberId: p.member_id,
          amount: parseFloat(p.amount),
          cycle: p.cycle,
          date: p.payout_date,
          status: p.status,
        })));

      } catch (error: any) {
        console.error('Error loading group data:', error);
        toast({
          title: "Error Loading Group",
          description: error.message || "Failed to load group data",
          variant: "destructive",
        });
      }
    };

    loadGroupData();
  }, [navigate, toast]);

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

  // Calculate payout stats - each payout is one cycle
  const totalPayouts = payouts.length;
  const currentCycle = totalPayouts + 1; // Next cycle to be paid
  const latestCompletedCycle = totalPayouts; // Last cycle that was paid
  
  // Progress in current rotation (0 to members.length)
  const payoutsInCurrentRotation = members.length > 0 ? totalPayouts % members.length : 0;
  const rotationProgress = members.length > 0 ? (payoutsInCurrentRotation / members.length) * 100 : 0;
  
  // Next member to receive payout
  const nextPayoutMember = members.length > 0 
    ? members[payoutsInCurrentRotation]
    : null;
  
  // Latest payout info
  const latestPayout = payouts.length > 0 ? payouts[0] : null; // Already sorted by created_at desc

  // Get member payout status - check if they've received a payout
  const getMemberStatus = (memberId: string) => {
    const memberPayouts = payouts.filter(p => p.memberId === memberId);
    return memberPayouts.length > 0 ? "Paid" : "Pending";
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
                total payouts made
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
                <span className="font-medium">Rotation Progress</span>
                <span className="text-muted-foreground">
                  {payoutsInCurrentRotation} of {members.length} paid
                </span>
              </div>
              <Progress value={rotationProgress} className="h-3" />
            </div>

            {latestPayout ? (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">
                  ✅ Latest: Cycle {latestCompletedCycle}
                  {latestPayout && 
                    ` - ${members.find(m => m.id === latestPayout.memberId)?.name} received ${totalAmount.toFixed(0)} AWG`
                  }
                </p>
              </div>
            ) : null}
            
            {nextPayoutMember ? (
              <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm text-muted-foreground">
                  <strong>Next (Cycle {currentCycle}):</strong> {nextPayoutMember.name} to receive {totalAmount.toFixed(0)} AWG
                </p>
              </div>
            ) : totalPayouts === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="mb-4">No payouts recorded yet</p>
                <Button onClick={() => navigate("/payout-management")} variant="outline" size="sm">
                  Start Recording Payouts
                </Button>
              </div>
            ) : null}
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
    </div>
  );
};

export default GroupDashboard;
