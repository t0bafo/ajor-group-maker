import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, DollarSign, Users, Settings, UserPlus, Plus, TrendingUp, Archive, Crown, Play, Bell } from "lucide-react";
import AppNavigation from "@/components/AppNavigation";
import ArchiveGroupModal from "@/components/ArchiveGroupModal";
import StartAjorModal from "@/components/StartAjorModal";
import BatchContributionModal from "@/components/BatchContributionModal";
import PendingRequestsCard from "@/components/PendingRequestsCard";
import UnpaidMembersCard from "@/components/UnpaidMembersCard";
import { GroupDashboardSkeleton } from "@/components/SkeletonLoader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNotification } from "@/hooks/useNotification";
import { getCurrentCycle } from "@/lib/dateUtils";

const GroupDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendNotification } = useNotification();
  const [groupData, setGroupData] = useState<any>({});
  const [members, setMembers] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [isHost, setIsHost] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [startingAjor, setStartingAjor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingReminders, setSendingReminders] = useState(false);

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
        // Fetch all data in parallel for faster loading
        const [
          { data: group, error: groupError },
          { data: membersData, error: membersError },
          { data: contributionsData, error: contributionsError },
          { data: payoutsData, error: payoutsError },
          { data: { user: currentUser } }
        ] = await Promise.all([
          supabase.from('groups').select('*').eq('id', groupId).maybeSingle(),
          supabase.from('members').select('*').eq('group_id', groupId).eq('status', 'approved').order('position'),
          supabase.from('contributions').select('*, members(name)').eq('group_id', groupId).order('created_at', { ascending: false }),
          supabase.from('payouts').select('*').eq('group_id', groupId).order('created_at', { ascending: false }),
          supabase.auth.getUser()
        ]);

        // Check for errors
        if (groupError) throw groupError;
        if (membersError) throw membersError;
        if (contributionsError) throw contributionsError;
        if (payoutsError) throw payoutsError;
        
        // Check if group exists
        if (!group) {
          toast({
            title: "Group Not Found",
            description: "You don't have access to this group or it doesn't exist",
            variant: "destructive",
          });
          navigate("/dashboard");
          return;
        }

        // Check if current user is the host
        const userIsHost = currentUser && group.host_id === currentUser.id;
        setIsHost(userIsHost);

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
          hostId: group.host_id,
          archived: group.archived || false,
          start_date: group.start_date,
          grace_period_days: group.grace_period_days || 3,
        });

        setMembers(membersData.map((m: any) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          userId: m.user_id,
        })));

        // Fetch pending requests if user is host
        if (userIsHost) {
          const { data: pendingData } = await supabase
            .from('members')
            .select('id, name, email, requested_at, join_message')
            .eq('group_id', groupId)
            .eq('status', 'pending')
            .order('requested_at', { ascending: true });

          setPendingRequests(pendingData || []);
        }

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
      } finally {
        setLoading(false);
      }
    };

    loadGroupData();
  }, [navigate, toast]);

  const reloadGroupData = async () => {
    const groupId = sessionStorage.getItem("currentGroupId");
    if (!groupId) return;

    try {
      const [
        { data: contributionsData },
        { data: payoutsData },
      ] = await Promise.all([
        supabase.from('contributions').select('*, members(name)').eq('group_id', groupId).order('created_at', { ascending: false }),
        supabase.from('payouts').select('*').eq('group_id', groupId).order('created_at', { ascending: false }),
      ]);

      if (contributionsData) {
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
      }

      if (payoutsData) {
        setPayouts(payoutsData.map((p: any) => ({
          id: p.id,
          memberId: p.member_id,
          amount: parseFloat(p.amount),
          cycle: p.cycle,
          date: p.payout_date,
          status: p.status,
        })));
      }
    } catch (error) {
      console.error('Error reloading data:', error);
    }
  };

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
  
  // Calculate unpaid members for current cycle (if Ajor has started)
  const unpaidMembers = groupData.start_date ? (() => {
    const actualCurrentCycle = getCurrentCycle(groupData.start_date, groupData.frequency);
    const contributedMemberIds = new Set(
      contributions
        .filter(c => c.cycle === actualCurrentCycle)
        .map(c => c.memberId)
    );
    return members.filter(m => !contributedMemberIds.has(m.id));
  })() : [];
  
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

  // Check if group is complete (all members have received at least one payout)
  const isGroupComplete = members.length > 0 && members.every(member => 
    payouts.some(p => p.memberId === member.id)
  );

  // Check if group is locked (has any payouts recorded)
  const isGroupLocked = payouts.length > 0;

  const handleStartAjor = async (adjustedMemberCount: number, startDate: Date, reorderedMembers?: any[]) => {
    setStartingAjor(true);
    try {
      // Update member positions if reordered
      if (reorderedMembers && reorderedMembers.length > 0) {
        const updates = reorderedMembers.map((member, index) => 
          supabase
            .from('members')
            .update({ position: index + 1 })
            .eq('id', member.id)
        );
        
        const results = await Promise.all(updates);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) {
          throw new Error('Failed to update member positions');
        }
      }

      const { error } = await supabase
        .from('groups')
        .update({ 
          start_date: startDate.toISOString(),
          number_of_members: adjustedMemberCount 
        })
        .eq('id', groupData.id);

      if (error) throw error;

      toast({
        title: "Ajor Started!",
        description: `${groupData.groupName} has been officially started. Payout calculations will begin from today.`,
      });

      setShowStartModal(false);
      
      // Update local state
      setGroupData({
        ...groupData,
        start_date: startDate.toISOString(),
        numberOfMembers: adjustedMemberCount,
      });

      // Reload members if reordered
      if (reorderedMembers) {
        const { data: updatedMembers } = await supabase
          .from('members')
          .select('*')
          .eq('group_id', groupData.id)
          .order('position');
        
        if (updatedMembers) {
          setMembers(updatedMembers.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.role,
            userId: m.user_id,
          })));
        }
      }
    } catch (error: any) {
      console.error('Error starting Ajor:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to start Ajor",
        variant: "destructive",
      });
    } finally {
      setStartingAjor(false);
    }
  };

  const handleArchiveGroup = async () => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ archived: true })
        .eq('id', groupData.id);

      if (error) throw error;

      toast({
        title: "Group Archived",
        description: "This Ajor has been moved to your archived groups",
      });

      setShowArchiveModal(false);
      navigate("/dashboard");
    } catch (error: any) {
      console.error('Error archiving group:', error);
      toast({
        title: "Error",
        description: "Failed to archive group. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendReminders = async () => {
    if (!groupData.start_date) {
      toast({
        title: "Cannot Send Reminders",
        description: "Please start the Ajor first before sending reminders",
        variant: "destructive",
      });
      return;
    }

    setSendingReminders(true);
    try {
      // Calculate current cycle
      const startDate = new Date(groupData.start_date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let currentCycle = 1;
      if (groupData.frequency === "weekly") {
        currentCycle = Math.floor(diffDays / 7) + 1;
      } else if (groupData.frequency === "biweekly") {
        currentCycle = Math.floor(diffDays / 14) + 1;
      } else {
        currentCycle = Math.floor(diffDays / 30) + 1;
      }

      // Get members who haven't contributed this cycle
      const contributedMemberIds = new Set(
        contributions
          .filter(c => c.cycle === currentCycle)
          .map(c => c.memberId)
      );

      const membersToRemind = members.filter(m => !contributedMemberIds.has(m.id));

      if (membersToRemind.length === 0) {
        toast({
          title: "All Members Contributed",
          description: "All members have already contributed for this cycle",
        });
        setSendingReminders(false);
        return;
      }

      // Calculate next cycle due date
      let nextCycleDate = new Date(startDate);
      if (groupData.frequency === "weekly") {
        nextCycleDate.setDate(startDate.getDate() + (currentCycle * 7));
      } else if (groupData.frequency === "biweekly") {
        nextCycleDate.setDate(startDate.getDate() + (currentCycle * 14));
      } else {
        nextCycleDate.setMonth(startDate.getMonth() + currentCycle);
      }

      // Send reminders to each member
      let successCount = 0;
      for (const member of membersToRemind) {
        try {
          const { error } = await supabase.functions.invoke("send-notification", {
            body: {
              type: "contribution_reminder",
              recipientEmail: member.email,
              recipientName: member.name,
              data: {
                groupName: groupData.groupName,
                amount: parseFloat(groupData.contributionAmount),
                cycleLabel: `Cycle ${currentCycle}`,
                dueDate: nextCycleDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              },
            },
          });

          if (!error) {
            successCount++;
          }
        } catch (error) {
          console.error(`Failed to send reminder to ${member.name}:`, error);
        }
      }

      toast({
        title: "Reminders Sent",
        description: `Successfully sent ${successCount} reminder${successCount !== 1 ? 's' : ''} to members who haven't contributed`,
      });

    } catch (error: any) {
      console.error('Error sending reminders:', error);
      toast({
        title: "Error",
        description: "Failed to send reminders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingReminders(false);
    }
  };

  const handleApproveMember = async (memberId: string, welcomeMessage?: string) => {
    try {
      // Update member status to approved
      const { error: updateError } = await supabase
        .from('members')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', memberId);

      if (updateError) throw updateError;

      // Get the approved member's details
      const { data: approvedMember } = await supabase
        .from('members')
        .select('name, email')
        .eq('id', memberId)
        .single();

      if (approvedMember) {
        // Send approval notification
        try {
          await sendNotification({
            type: "request_approved",
            recipientEmail: approvedMember.email,
            recipientName: approvedMember.name,
            data: {
              groupName: groupData.groupName,
              hostName: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Host',
              welcomeMessage,
              contributionAmount: parseFloat(groupData.contributionAmount),
              frequency: groupData.frequency,
            },
          });
        } catch (notifError) {
          console.error("Failed to send approval notification:", notifError);
        }
      }

      toast({
        title: "Member Approved",
        description: `${approvedMember?.name || 'Member'} has been added to the group`,
      });

      // Reload pending requests and members
      const groupId = sessionStorage.getItem("currentGroupId");
      if (groupId) {
        const [{ data: pendingData }, { data: membersData }] = await Promise.all([
          supabase
            .from('members')
            .select('id, name, email, requested_at, join_message')
            .eq('group_id', groupId)
            .eq('status', 'pending')
            .order('requested_at', { ascending: true }),
          supabase
            .from('members')
            .select('*')
            .eq('group_id', groupId)
            .eq('status', 'approved')
            .order('position'),
        ]);

        setPendingRequests(pendingData || []);
        if (membersData) {
          setMembers(membersData.map((m: any) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            role: m.role,
            userId: m.user_id,
          })));
        }
      }
    } catch (error: any) {
      console.error('Error approving member:', error);
      toast({
        title: "Error",
        description: "Failed to approve member. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectMember = async (memberId: string, reason: string) => {
    try {
      // Update member status to rejected
      const { error: updateError } = await supabase
        .from('members')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          rejection_reason: reason,
        })
        .eq('id', memberId);

      if (updateError) throw updateError;

      toast({
        title: "Request Rejected",
        description: "The join request has been declined",
      });

      // Reload pending requests
      const groupId = sessionStorage.getItem("currentGroupId");
      if (groupId) {
        const { data: pendingData } = await supabase
          .from('members')
          .select('id, name, email, requested_at, join_message')
          .eq('group_id', groupId)
          .eq('status', 'pending')
          .order('requested_at', { ascending: true });

        setPendingRequests(pendingData || []);
      }
    } catch (error: any) {
      console.error('Error rejecting member:', error);
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
        <AppNavigation 
          userEmail={user?.email} 
          userName={user?.user_metadata?.full_name}
        />
        <div className="container max-w-6xl mx-auto px-4 py-8">
          <GroupDashboardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <AppNavigation 
        userEmail={user?.email} 
        userName={user?.user_metadata?.full_name}
      />
      
      <div className="container max-w-6xl mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{groupData.groupName || "Your Ajor Group"}</h1>
              {isHost ? (
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Crown className="h-3 w-3 mr-1" />
                  Host
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-muted/50">
                  Member
                </Badge>
              )}
              {groupData.archived && (
                <Badge variant="outline" className="bg-muted">
                  Archived
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">{groupData.description}</p>
            {isGroupLocked && (
              <Badge variant="outline" className="mt-2 bg-accent/10 text-accent border-accent/30">
                🔒 Locked - Payouts in progress
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {isHost && !groupData.archived && (
              <>
                {!groupData.start_date && !isGroupLocked && (
                  <Button 
                    size="sm"
                    onClick={() => setShowStartModal(true)}
                    className="hover:shadow-lg transition-all"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Ajor
                  </Button>
                )}
                {isGroupComplete && groupData.start_date && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowArchiveModal(true)}
                    className="text-accent border-accent/30 hover:bg-accent/10"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </Button>
                )}
              </>
            )}
            {!isGroupLocked && (
              <Button 
                variant="outline" 
                size="icon" 
                className="shrink-0"
                onClick={() => navigate("/group-overview")}
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all duration-300 hover:-translate-y-1 group">
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

          <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Payout Progress
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-accent group-hover:scale-110 transition-transform" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalPayouts}</div>
              <p className="text-sm text-muted-foreground mt-1">
                total payouts made
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-medium)] transition-all duration-300 hover:-translate-y-1 group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Members
              </CardTitle>
              <Users className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">Payout Tracking</CardTitle>
                <CardDescription className="text-sm">Monitor payout completion and rotation progress</CardDescription>
                {isGroupComplete && !groupData.archived && isHost && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-900 dark:text-green-100">
                      All members have received their payout! You can now archive this group.
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button 
                  onClick={() => navigate("/group-ledger")} 
                  variant="outline"
                  size="sm" 
                  className="flex-1 sm:flex-none"
                >
                  View Ledger
                </Button>
                {isHost && !groupData.archived && (
                  <Button 
                    onClick={() => navigate("/payout-management")} 
                    size="sm" 
                    className="flex-1 sm:flex-none"
                  >
                    Manage Payouts
                  </Button>
                )}
              </div>
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
                  Latest: Cycle {latestCompletedCycle}
                  {latestPayout && 
                    ` - ${members.find(m => m.id === latestPayout.memberId)?.name} received $${totalAmount.toFixed(0)}`
                  }
                </p>
              </div>
            ) : null}
            
            {nextPayoutMember ? (
              <div className="p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/20 rounded-lg border border-primary/20">
                <p className="text-sm">
                  <strong className="text-foreground">Next Recipient (Cycle {currentCycle}):</strong>
                  <span className="text-muted-foreground ml-2">{nextPayoutMember.name} will receive ${totalAmount.toFixed(0)}</span>
                </p>
              </div>
            ) : totalPayouts === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="mb-4">No payouts recorded yet</p>
                {isHost && (
                  <Button onClick={() => navigate("/payout-management")} variant="outline" size="sm">
                    Start Recording Payouts
                  </Button>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="shadow-[var(--shadow-medium)] mb-8">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg sm:text-xl">Contribution Tracking</CardTitle>
                <CardDescription className="text-sm">Track all member contributions for this cycle</CardDescription>
              </div>
              {isHost && !groupData.archived && (
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    onClick={handleSendReminders} 
                    variant="outline" 
                    size="sm" 
                    disabled={sendingReminders}
                    className="flex-1 sm:flex-none"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    {sendingReminders ? "Sending..." : "Send Reminder"}
                  </Button>
                  <Button 
                    onClick={() => setShowBatchModal(true)} 
                    size="sm" 
                    className="flex-1 sm:flex-none bg-primary hover:bg-primary/90"
                    disabled={!groupData.start_date}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Quick Entry
                  </Button>
                  <Button 
                    onClick={() => navigate("/record-contribution")} 
                    variant="outline"
                    size="sm" 
                    className="flex-1 sm:flex-none"
                  >
                    Single Entry
                  </Button>
                </div>
              )}
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

            {/* Contribution Table - Mobile Responsive */}
            {contributions.length > 0 ? (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block border rounded-lg overflow-hidden">
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
                
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {contributions.map((contribution) => (
                    <div key={contribution.id} className="p-4 border rounded-lg space-y-2 bg-secondary/30">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{contribution.memberName}</p>
                          <p className="text-sm text-muted-foreground">{contribution.cycleLabel}</p>
                        </div>
                        <Badge variant="default" className="bg-green-600">
                          {contribution.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">${contribution.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date:</span>
                        <span>
                          {new Date(contribution.date).toLocaleDateString("en-US", { 
                            month: "short", 
                            day: "numeric" 
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4 text-sm sm:text-base">No contributions recorded yet</p>
                {isHost && (
                  <Button onClick={() => navigate("/record-contribution")} variant="outline" className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" />
                    Record First Contribution
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Requests Card - Show for hosts when there are pending requests */}
        {isHost && pendingRequests.length > 0 && (
          <div className="mb-8">
            <PendingRequestsCard
              requests={pendingRequests}
              onApprove={handleApproveMember}
              onReject={handleRejectMember}
            />
          </div>
        )}

        {/* Unpaid Members Card - Show when Ajor has started and there are unpaid members */}
        {groupData.start_date && unpaidMembers.length > 0 && (
          <div className="mb-8">
            <UnpaidMembersCard
              unpaidMembers={unpaidMembers}
              groupData={{
                start_date: groupData.start_date,
                frequency: groupData.frequency,
                grace_period_days: groupData.grace_period_days,
              }}
            />
          </div>
        )}

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
                className="w-full text-sm sm:text-base"
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
            <CardTitle className="text-lg sm:text-xl">Member List & Payout Order</CardTitle>
            <CardDescription className="text-sm">
              Rotation order: {groupData.rotationOrder === "sequential" ? "Sequential" : "Random"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold shrink-0">
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                      {member.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-auto">
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
      
      <StartAjorModal
        open={showStartModal}
        onOpenChange={setShowStartModal}
        groupName={groupData.groupName || ""}
        currentMemberCount={members.length}
        plannedMemberCount={groupData.numberOfMembers || 0}
        members={members}
        onConfirm={handleStartAjor}
        loading={startingAjor}
      />

      <ArchiveGroupModal 
        open={showArchiveModal}
        onOpenChange={setShowArchiveModal}
        groupName={groupData.groupName || ""}
        isArchived={groupData.archived || false}
        onConfirm={handleArchiveGroup}
      />

      <BatchContributionModal
        open={showBatchModal}
        onOpenChange={setShowBatchModal}
        groupData={{
          id: groupData.id,
          groupName: groupData.groupName || "",
          contributionAmount: parseFloat(groupData.contributionAmount || 0),
          frequency: groupData.frequency || "monthly",
          start_date: groupData.start_date,
        }}
        members={members}
        onSuccess={reloadGroupData}
      />
    </div>
  );
};

export default GroupDashboard;
