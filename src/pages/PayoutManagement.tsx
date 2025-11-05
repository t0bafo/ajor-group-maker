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
    const checkHostAccess = async () => {
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

        const { data: group, error } = await supabase
          .from('groups')
          .select('host_id')
          .eq('id', groupId)
          .single();

        if (error) throw error;

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
        
        // Load existing data from sessionStorage
        const storedGroup = sessionStorage.getItem("ajorGroup");
        const storedMembers = sessionStorage.getItem("ajorMembers");
        const storedPayouts = sessionStorage.getItem("payouts");

        if (storedGroup) setGroupData(JSON.parse(storedGroup));
        if (storedMembers) setMembers(JSON.parse(storedMembers));
        if (storedPayouts) setPayouts(JSON.parse(storedPayouts));
      } catch (error: any) {
        console.error('Error checking host access:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to verify access",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    checkHostAccess();
  }, [navigate, toast]);

  const totalAmount =
    parseFloat(groupData?.contributionAmount || 0) *
    parseInt(groupData?.numberOfMembers || 0);

  const currentPayoutMember = members.find(
    (m, idx) => idx + 1 === (payouts.length % members.length) + 1
  );

  const payoutProgress = members.length > 0 ? (payouts.length / members.length) * 100 : 0;

  const handleRecordPayout = (member: any) => {
    // Check if payout already recorded
    const existingPayout = payouts.find(
      (p) => p.memberId === member.id && p.cycle === currentCycle
    );

    if (existingPayout) {
      toast({
        title: "Payout Already Recorded",
        description: "This member has already received their payout for this cycle.",
        variant: "destructive",
      });
      return;
    }

    setSelectedMember(member);
    setShowPayoutModal(true);
  };

  const confirmPayout = (note: string) => {
    if (!selectedMember) return;

    const newPayout = {
      id: Date.now().toString(),
      memberId: selectedMember.id,
      memberName: selectedMember.name,
      amount: totalAmount,
      cycle: currentCycle,
      date: new Date().toISOString(),
      note: note,
      status: "Paid",
    };

    const updatedPayouts = [...payouts, newPayout];
    setPayouts(updatedPayouts);
    sessionStorage.setItem("payouts", JSON.stringify(updatedPayouts));

    // Notify all members
    toast({
      title: "Group Notified",
      description: `All members have been notified that ${selectedMember.name} received their payout.`,
    });
  };

  const getMemberPayoutStatus = (memberId: string | number) => {
    const payout = payouts.find(
      (p) => p.memberId === memberId && p.cycle === currentCycle
    );
    return payout ? "Paid" : "Pending";
  };

  if (loading || !isHost) {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Payout Management</h1>
          <p className="text-muted-foreground">
            Track and record payouts for {groupData.groupName}
          </p>
        </div>

        {/* Current Cycle Highlight */}
        {currentPayoutMember && (
          <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/20 border border-primary/20 animate-fade-in">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
                  <DollarSign className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    Cycle {currentCycle}: Paying {currentPayoutMember.name}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Current payout amount: ${totalAmount.toFixed(2)}
                  </p>
                  {getMemberPayoutStatus(currentPayoutMember.id) === "Pending" && (
                    <Button
                      onClick={() => handleRecordPayout(currentPayoutMember)}
                      size="sm"
                    >
                      Record Payout
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Payouts Made
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{payouts.length}</div>
              <p className="text-sm text-muted-foreground mt-1">
                of {members.length} members
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
              <p className="text-sm text-muted-foreground mt-1">Cycle {currentCycle}</p>
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
            <CardTitle className="text-xl">Payout Progress</CardTitle>
            <CardDescription>Track completion of the current cycle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Current Cycle</span>
                <span className="text-muted-foreground">
                  {payouts.length} / {members.length} paid
                </span>
              </div>
              <Progress value={payoutProgress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Payout Order List */}
        <Card className="shadow-[var(--shadow-medium)]">
          <CardHeader>
            <CardTitle className="text-xl">Payout Rotation Order</CardTitle>
            <CardDescription>
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
                    className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                      isCurrent
                        ? "bg-gradient-to-r from-primary/10 to-accent/10 border-2 border-primary/30"
                        : "bg-secondary/50 hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-sm font-bold">
                        #{index + 1}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                        {member.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.name}
                          {isCurrent && (
                            <span className="ml-2 text-sm text-primary font-semibold">
                              (Current)
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={status === "Paid" ? "default" : "outline"}
                        className={status === "Paid" ? "bg-green-600" : ""}
                      >
                        {status === "Paid" ? (
                          <>
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Paid
                          </>
                        ) : (
                          <>
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </>
                        )}
                      </Badge>
                      {isCurrent && status === "Pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleRecordPayout(member)}
                        >
                          Record Payout
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {payoutProgress === 100 && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-green-900 dark:text-green-100">
                    Cycle Complete!
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                    All members have received their payouts for Cycle {currentCycle}.
                  </p>
                </div>
              </div>
            )}

            {payoutProgress > 0 && payoutProgress < 100 && (
              <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Reminder:</strong> You must complete the current payout before
                    proceeding to the next member in rotation.
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
