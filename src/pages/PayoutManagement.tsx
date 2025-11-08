import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, DollarSign, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import RecordPayoutModal from "@/components/RecordPayoutModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PayoutManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groupData, setGroupData] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(1);
  const [isHost, setIsHost] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const groupId = sessionStorage.getItem("currentGroupId");
      if (!groupId) {
        toast({
          title: "No Group Selected",
          description: "Please select a group first",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }

        // Fetch group data
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;

        if (group.host_id !== user.id) {
          toast({
            title: "Access Denied",
            description: "Only the group host can manage payouts",
            variant: "destructive",
          });
          navigate("/group-dashboard");
          return;
        }

        setIsHost(true);
        setGroupData(group);

        // Fetch members
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .eq('group_id', groupId)
          .order('position', { ascending: true });

        if (membersError) throw membersError;
        setMembers(membersData || []);

        // Fetch payouts
        const { data: payoutsData, error: payoutsError } = await supabase
          .from('payouts')
          .select('*')
          .eq('group_id', groupId)
          .order('created_at', { ascending: true });

        if (payoutsError) throw payoutsError;
        setPayouts(payoutsData || []);

        // Each payout = one cycle. Next cycle to pay out is totalPayouts + 1
        const totalPayouts = payoutsData?.length || 0;
        setCurrentCycle(totalPayouts + 1);
      } catch (error: any) {
        if (import.meta.env.DEV) {
          console.error('Error loading data:', error);
        }
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate, toast]);

  const totalAmount =
    parseFloat(groupData?.contribution_amount || 0) *
    parseInt(groupData?.number_of_members || 0);

  // Current cycle is the next payout to be made
  // Find next member in rotation based on position
  const currentPayoutMember = members.length > 0 
    ? members[(payouts.length % members.length)]
    : null;

  // Progress based on current rotation (0 to members.length)
  const payoutsInCurrentRotation = payouts.length % members.length;
  const payoutProgress = members.length > 0 
    ? (payoutsInCurrentRotation / members.length) * 100 
    : 0;

  const handleRecordPayout = async (member: any) => {
    // Only allow recording payout for the current member in rotation
    if (member.id !== currentPayoutMember?.id) {
      toast({
        title: "Wrong Rotation Order",
        description: "Please pay members in their rotation order.",
        variant: "destructive",
      });
      return;
    }

    // Check if payout already exists for this cycle
    const { data: existingPayout } = await supabase
      .from('payouts')
      .select('id')
      .eq('group_id', groupData.id)
      .eq('cycle', currentCycle)
      .maybeSingle();

    if (existingPayout) {
      toast({
        title: "Cycle Already Completed",
        description: "This cycle already has a payout recorded.",
        variant: "destructive",
      });
      return;
    }

    setSelectedMember(member);
    setShowPayoutModal(true);
  };

  const confirmPayout = async (note: string) => {
    if (!selectedMember || !groupData) return;

    try {
      // Insert payout into database
      const { data: newPayout, error } = await supabase
        .from('payouts')
        .insert({
          group_id: groupData.id,
          member_id: selectedMember.id,
          amount: totalAmount,
          cycle: currentCycle,
          payout_date: new Date().toISOString(),
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;

      const updatedPayouts = [...payouts, newPayout];
      setPayouts(updatedPayouts);
      
      // Increment to next cycle
      setCurrentCycle(currentCycle + 1);

      // Check if rotation is complete (all members paid once)
      if (updatedPayouts.length % members.length === 0) {
        toast({
          title: "Rotation Complete! 🎉",
          description: `All ${members.length} members have received a payout. Starting new rotation.`,
        });
      } else {
        toast({
          title: "Payout Recorded",
          description: `${selectedMember.name} received their payout of $${totalAmount.toFixed(2)}.`,
        });
      }
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error recording payout:', error);
      }
      toast({
        title: "Error",
        description: "Failed to record payout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getMemberPayoutStatus = (memberId: string | number) => {
    // Check if this member is the current one to be paid
    return memberId === currentPayoutMember?.id ? "Current" : "Pending";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-8 md:py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Payout Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Track and record payouts for {groupData.group_name}
          </p>
        </div>

        {/* Current Cycle Highlight */}
        {currentPayoutMember && (
          <div className="mb-8 p-4 sm:p-6 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/20 border border-primary/20 animate-fade-in">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                <DollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  Cycle {currentCycle}: Paying {currentPayoutMember.name}
                </h2>
                <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                  Current payout amount: ${totalAmount.toFixed(2)}
                </p>
                {getMemberPayoutStatus(currentPayoutMember.id) === "Pending" && (
                  <Button
                    onClick={() => handleRecordPayout(currentPayoutMember)}
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    Record Payout
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Payouts Made
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{payoutsInCurrentRotation}</div>
              <p className="text-sm text-muted-foreground mt-1">
                of {members.length} in current rotation
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Distributed
              </CardTitle>
              <DollarSign className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${(payouts.length * totalAmount).toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Total distributed</p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cycle Progress
              </CardTitle>
              <Clock className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{Math.round(payoutProgress)}%</div>
              <p className="text-sm text-muted-foreground mt-1">Complete</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Tracker */}
        <Card className="shadow-[var(--shadow-medium)] mb-8">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Payout Progress</CardTitle>
            <CardDescription className="text-sm">Track completion of the current cycle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Current Rotation</span>
                <span className="text-muted-foreground">
                  {payoutsInCurrentRotation} / {members.length} paid
                </span>
              </div>
              <Progress value={payoutProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Payout Order List */}
        <Card className="shadow-[var(--shadow-medium)]">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Payout Rotation Order</CardTitle>
            <CardDescription className="text-sm">
              Members receive ${totalAmount.toFixed(2)} when it's their turn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member, index) => {
                const status = getMemberPayoutStatus(member.id);
                const isCurrent = member.id === currentPayoutMember?.id;

                return (
                  <div
                    key={member.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg transition-all ${
                      isCurrent
                        ? "bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30"
                        : "bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-sm font-bold shrink-0">
                        #{index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                        {member.name[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {member.name}
                          {isCurrent && (
                            <span className="ml-2 text-xs sm:text-sm text-primary font-semibold">
                              (Current)
                            </span>
                          )}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto w-full sm:w-auto">
                      <Badge
                        variant={status === "Current" ? "default" : "outline"}
                        className={status === "Current" ? "bg-primary" : ""}
                      >
                        {status === "Current" ? (
                          <>
                            <DollarSign className="mr-1 h-3 w-3" />
                            Current
                          </>
                        ) : (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </>
                        )}
                      </Badge>
                      {isCurrent && (
                        <Button
                          size="sm"
                          onClick={() => handleRecordPayout(member)}
                          className="flex-1 sm:flex-none"
                        >
                          Record Payout
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {payoutProgress === 0 && payouts.length > 0 && payouts.length % members.length === 0 && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Rotation Complete!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    All {members.length} members have received a payout. Starting new rotation.
                  </p>
                </div>
              </div>
            )}

            {currentPayoutMember && (
              <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Next:</strong> Pay {currentPayoutMember.name} ${totalAmount.toFixed(2)} (Cycle {currentCycle})
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedMember && (
        <RecordPayoutModal
          open={showPayoutModal}
          onOpenChange={setShowPayoutModal}
          member={{
            id: selectedMember.id,
            name: selectedMember.name,
            position: members.findIndex((m) => m.id === selectedMember.id) + 1,
          }}
          amount={totalAmount}
          cycle={currentCycle}
          onConfirm={confirmPayout}
        />
      )}
    </div>
  );
};

export default PayoutManagement;
