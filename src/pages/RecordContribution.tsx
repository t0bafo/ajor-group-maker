import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, DollarSign, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const RecordContribution = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groupData, setGroupData] = useState<any>(null);
  const [currentMember, setCurrentMember] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState("");
  const [note, setNote] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [errors, setErrors] = useState<any>({});

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
        // Get current user
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

        // Fetch current member
        const { data: member, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('group_id', groupId)
          .eq('user_id', user.id)
          .single();

        if (memberError) throw memberError;

        setGroupData({
          id: group.id,
          groupName: group.group_name,
          contributionAmount: group.contribution_amount,
          frequency: group.frequency,
        });
        setCurrentMember(member);
        setAmount(group.contribution_amount.toString());
      } catch (error: any) {
        console.error('Error loading data:', error);
        toast({
          title: "Error Loading Data",
          description: error.message || "Failed to load group data",
          variant: "destructive",
        });
      }
    };

    loadData();
  }, [navigate, toast]);

  const generateCycles = () => {
    if (!groupData) return [];
    const cycles = [];
    const today = new Date();
    
    for (let i = 1; i <= 12; i++) {
      const cycleDate = new Date(today);
      if (groupData.frequency === "weekly") {
        cycleDate.setDate(today.getDate() + (i - 1) * 7);
      } else if (groupData.frequency === "biweekly") {
        cycleDate.setDate(today.getDate() + (i - 1) * 14);
      } else {
        cycleDate.setMonth(today.getMonth() + (i - 1));
      }
      
      cycles.push({
        id: i,
        label: `Cycle ${i} - ${cycleDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
        date: cycleDate.toISOString()
      });
    }
    return cycles;
  };

  const validateForm = async () => {
    const newErrors: any = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount.";
    }
    
    if (!cycle) {
      newErrors.cycle = "Please select a contribution cycle.";
    }
    
    // Check for duplicate entries in database
    if (groupData && currentMember) {
      const { data: existingContribution } = await supabase
        .from('contributions')
        .select('id')
        .eq('group_id', groupData.id)
        .eq('member_id', currentMember.id)
        .eq('cycle', parseInt(cycle))
        .single();

      if (existingContribution) {
        newErrors.duplicate = "Contribution already logged for this cycle.";
        toast({
          title: "Duplicate Entry",
          description: "You have already recorded a contribution for this cycle.",
          variant: "destructive",
        });
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (await validateForm()) {
      setShowConfirmation(true);
    }
  };

  const confirmContribution = async () => {
    try {
      const selectedCycle = generateCycles().find(c => c.id.toString() === cycle);
      
      // Save contribution to database
      const { error } = await supabase
        .from('contributions')
        .insert({
          group_id: groupData.id,
          member_id: currentMember.id,
          amount: parseFloat(amount),
          cycle: parseInt(cycle),
          cycle_label: selectedCycle?.label || `Cycle ${cycle}`,
          note: note,
          status: 'paid',
        });

      if (error) throw error;

      setShowConfirmation(false);
      
      toast({
        title: "✅ Contribution Recorded!",
        description: `Your contribution of $${amount} has been successfully logged.`,
      });
      
      // Navigate back to group dashboard
      setTimeout(() => {
        navigate("/group-dashboard");
      }, 1000);
    } catch (error: any) {
      console.error('Error recording contribution:', error);
      toast({
        title: "Error Recording Contribution",
        description: error.message || "Failed to record contribution",
        variant: "destructive",
      });
      setShowConfirmation(false);
    }
  };

  if (!groupData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const cycles = generateCycles();
  const selectedCycle = cycles.find(c => c.id.toString() === cycle);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-8 md:py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Record Contribution</h1>
          <p className="text-muted-foreground">
            Log your {groupData.frequency} contribution for {groupData.groupName}
          </p>
        </div>

        <Card className="shadow-[var(--shadow-medium)]">
          <CardHeader>
            <CardTitle className="text-xl">Contribution Details</CardTitle>
            <CardDescription>
              Enter your contribution information for this cycle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Contribution Amount *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-9"
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-destructive">{errors.amount}</p>
                )}
              </div>

              {/* Cycle Selection */}
              <div className="space-y-2">
                <Label htmlFor="cycle">Contribution Cycle *</Label>
                <Select value={cycle} onValueChange={setCycle}>
                  <SelectTrigger id="cycle">
                    <SelectValue placeholder="Select a cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {cycles.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cycle && (
                  <p className="text-sm text-destructive">{errors.cycle}</p>
                )}
              </div>

              {/* Optional Note */}
              <div className="space-y-2">
                <Label htmlFor="note">Note (Optional)</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., Paid via Cash App, Transferred to host..."
                  rows={3}
                />
              </div>

              {/* Summary Card */}
              {amount && cycle && (
                <div className="p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/20 border border-primary/20 rounded-lg space-y-2 animate-fade-in">
                  <p className="text-sm font-semibold text-foreground">Summary</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cycle:</span>
                      <span className="font-semibold">{selectedCycle?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-semibold">
                        {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button type="submit" className="w-full" size="lg">
                <Calendar className="mr-2 h-4 w-4" />
                Record Contribution
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Confirmation Modal */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Contribution</DialogTitle>
              <DialogDescription>
                Please verify your contribution details before saving.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4">
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-semibold text-lg">${parseFloat(amount || "0").toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Cycle</span>
                <span className="font-medium">{selectedCycle?.label}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Date</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
              {note && (
                <div className="p-3 bg-secondary/50 rounded-lg">
                  <span className="text-sm text-muted-foreground block mb-1">Note</span>
                  <span className="font-medium text-sm">{note}</span>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                Cancel
              </Button>
              <Button onClick={confirmContribution}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default RecordContribution;
