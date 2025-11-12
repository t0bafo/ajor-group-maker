import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, Calendar, Loader2, CalendarIcon } from "lucide-react";
import { getDueDateForCycle, isPaymentLate } from "@/lib/dateUtils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  name: string;
  email: string;
}

interface BatchContributionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupData: {
    id: string;
    groupName: string;
    contributionAmount: number;
    frequency: string;
    start_date: string;
  };
  members: Member[];
  onSuccess: () => void;
}

const BatchContributionModal = ({ open, onOpenChange, groupData, members, onSuccess }: BatchContributionModalProps) => {
  const { toast } = useToast();
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [cycle, setCycle] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Zelle");
  const [contributionDate, setContributionDate] = useState<Date>(new Date());
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setSelectedMembers(new Set());
      setCycle(getCurrentCycle().toString());
      setPaymentMethod("Zelle");
      setContributionDate(new Date());
    }
  }, [open]);

  const getCurrentCycle = () => {
    if (!groupData.start_date) return 1;
    
    const startDate = new Date(groupData.start_date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (groupData.frequency === "weekly") {
      return Math.floor(diffDays / 7) + 1;
    } else if (groupData.frequency === "biweekly") {
      return Math.floor(diffDays / 14) + 1;
    } else {
      return Math.floor(diffDays / 30) + 1;
    }
  };

  const generateCycles = () => {
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

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const selectAll = () => {
    if (selectedMembers.size === members.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(members.map(m => m.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedMembers.size === 0) {
      toast({
        title: "No Members Selected",
        description: "Please select at least one member",
        variant: "destructive",
      });
      return;
    }

    if (!cycle) {
      toast({
        title: "No Cycle Selected",
        description: "Please select a contribution cycle",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const selectedCycle = generateCycles().find(c => c.id.toString() === cycle);
      
      // Check for existing contributions and payouts
      const membersToRecord = Array.from(selectedMembers);
      
      // Check if payout exists for this cycle
      const { data: existingPayout } = await supabase
        .from('payouts')
        .select('id')
        .eq('group_id', groupData.id)
        .eq('cycle', parseInt(cycle))
        .maybeSingle();

      if (existingPayout) {
        toast({
          title: "Cycle Completed",
          description: "Cannot record contributions for this cycle as the payout has already been made.",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Check for existing contributions
      const { data: existingContributions } = await supabase
        .from('contributions')
        .select('member_id')
        .eq('group_id', groupData.id)
        .eq('cycle', parseInt(cycle))
        .in('member_id', membersToRecord);

      const existingMemberIds = new Set(existingContributions?.map(c => c.member_id) || []);
      const newMembers = membersToRecord.filter(id => !existingMemberIds.has(id));

      if (newMembers.length === 0) {
        toast({
          title: "All Contributions Recorded",
          description: "All selected members already have contributions for this cycle",
          variant: "destructive",
        });
        setSubmitting(false);
        return;
      }

      // Fetch full group data for grace period
      const { data: fullGroup } = await supabase
        .from('groups')
        .select('grace_period_days')
        .eq('id', groupData.id)
        .single();

      const gracePeriodDays = fullGroup?.grace_period_days || 3;
      const dueDate = getDueDateForCycle(groupData.start_date, groupData.frequency, parseInt(cycle));
      const paidAt = contributionDate;
      const isLate = isPaymentLate(paidAt, dueDate, gracePeriodDays);

      // Record contributions for new members
      const contributions = newMembers.map(memberId => ({
        group_id: groupData.id,
        member_id: memberId,
        amount: groupData.contributionAmount,
        cycle: parseInt(cycle),
        cycle_label: selectedCycle?.label || `Cycle ${cycle}`,
        payment_method: paymentMethod,
        status: 'paid',
        due_date: dueDate.toISOString(),
        paid_at: paidAt.toISOString(),
        is_late: isLate,
      }));

      const { error } = await supabase
        .from('contributions')
        .insert(contributions);

      if (error) throw error;

      const skippedCount = selectedMembers.size - newMembers.length;
      
      toast({
        title: "Contributions Recorded!",
        description: `Successfully recorded ${newMembers.length} contribution${newMembers.length !== 1 ? 's' : ''}${skippedCount > 0 ? ` (${skippedCount} already recorded)` : ''}`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error recording contributions:', error);
      toast({
        title: "Error",
        description: "Failed to record contributions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cycles = generateCycles();
  const selectedCycle = cycles.find(c => c.id.toString() === cycle);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record Multiple Contributions</DialogTitle>
          <DialogDescription>
            Select members who have paid their contributions for this cycle
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cycle Selection */}
          <div className="space-y-2">
            <Label htmlFor="batch-cycle">Contribution Cycle *</Label>
            <Select value={cycle} onValueChange={setCycle}>
              <SelectTrigger id="batch-cycle">
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
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="batch-payment">Payment Method *</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger id="batch-payment">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Zelle">Zelle</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Venmo">Venmo</SelectItem>
                <SelectItem value="CashApp">CashApp</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Contribution Date */}
          <div className="space-y-2">
            <Label htmlFor="batch-date">Contribution Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="batch-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !contributionDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {contributionDate ? format(contributionDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={contributionDate}
                  onSelect={(date) => date && setContributionDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Members Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Select Members ({selectedMembers.size}/{members.length})</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={selectAll}
              >
                {selectedMembers.size === members.length ? "Deselect All" : "Select All"}
              </Button>
            </div>
            
            <div className="border rounded-lg divide-y max-h-64 overflow-y-auto">
              {members.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => toggleMember(member.id)}
                >
                  <Checkbox
                    checked={selectedMembers.has(member.id)}
                    onCheckedChange={() => toggleMember(member.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${groupData.contributionAmount}</p>
                    <p className="text-xs text-muted-foreground">{paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          {selectedMembers.size > 0 && cycle && (
            <div className="p-4 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/20 border border-primary/20 rounded-lg space-y-2">
              <p className="text-sm font-semibold">Summary</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members Selected:</span>
                  <span className="font-semibold">{selectedMembers.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Each:</span>
                  <span className="font-semibold">${groupData.contributionAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold">${(groupData.contributionAmount * selectedMembers.size).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cycle:</span>
                  <span className="font-semibold">{selectedCycle?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-semibold">{paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-semibold">{format(contributionDate, "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || selectedMembers.size === 0}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Calendar className="mr-2 h-4 w-4" />
                Record {selectedMembers.size} Contribution{selectedMembers.size !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchContributionModal;
