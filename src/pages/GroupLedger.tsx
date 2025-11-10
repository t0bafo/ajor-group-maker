import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, DollarSign, TrendingUp, Calendar, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LedgerEntry {
  id: string;
  type: 'contribution' | 'payout';
  memberName: string;
  amount: number;
  cycle: number;
  cycleLabel?: string;
  date: string;
  paymentMethod?: string;
  status: string;
  isLate?: boolean;
  dueDate?: string;
}

const GroupLedger = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groupData, setGroupData] = useState<any>(null);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const loadLedgerData = async () => {
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
        // Fetch group data
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();

        if (groupError) throw groupError;
        setGroupData(group);

        // Fetch contributions with member names
        const { data: contributions, error: contribError } = await supabase
          .from('contributions')
          .select(`
            id,
            amount,
            cycle,
            cycle_label,
            created_at,
            payment_method,
            status,
            is_late,
            due_date,
            member_id,
            members!inner(name)
          `)
          .eq('group_id', groupId);

        if (contribError) throw contribError;

        // Fetch payouts with member names
        const { data: payouts, error: payoutError } = await supabase
          .from('payouts')
          .select(`
            id,
            amount,
            cycle,
            payout_date,
            status,
            member_id,
            members!inner(name)
          `)
          .eq('group_id', groupId);

        if (payoutError) throw payoutError;

        // Combine and format entries
        const allEntries: LedgerEntry[] = [
          ...(contributions || []).map((c: any) => ({
            id: c.id,
            type: 'contribution' as const,
            memberName: c.members?.name || 'Unknown',
            amount: parseFloat(c.amount),
            cycle: c.cycle,
            cycleLabel: c.cycle_label,
            date: c.created_at,
            paymentMethod: c.payment_method,
            status: c.status,
            isLate: c.is_late,
            dueDate: c.due_date,
          })),
          ...(payouts || []).map((p: any) => ({
            id: p.id,
            type: 'payout' as const,
            memberName: p.members?.name || 'Unknown',
            amount: parseFloat(p.amount),
            cycle: p.cycle,
            date: p.payout_date,
            status: p.status,
          })),
        ];

        // Sort by date (newest first)
        allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setLedgerEntries(allEntries);
      } catch (error: any) {
        console.error('Error loading ledger:', error);
        toast({
          title: "Error",
          description: "Failed to load ledger data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadLedgerData();
  }, [navigate, toast]);

  const filteredEntries = ledgerEntries.filter(entry => {
    if (activeTab === "all") return true;
    return entry.type === activeTab;
  });

  const totalContributions = ledgerEntries
    .filter(e => e.type === 'contribution')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPayouts = ledgerEntries
    .filter(e => e.type === 'payout')
    .reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading ledger...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-8 md:py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/group-dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">Group Ledger</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Complete transaction history for {groupData?.group_name}
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-base">
                <DollarSign className="h-5 w-5 text-primary" />
                Total Contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalContributions.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {ledgerEntries.filter(e => e.type === 'contribution').length} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5 text-accent" />
                Total Payouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalPayouts.toFixed(2)}</div>
              <p className="text-sm text-muted-foreground mt-1">
                {ledgerEntries.filter(e => e.type === 'payout').length} payouts made
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-primary" />
                All Transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ledgerEntries.length}</div>
              <p className="text-sm text-muted-foreground mt-1">
                Complete history
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ledger Entries */}
        <Card className="shadow-[var(--shadow-medium)]">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Transaction History</CardTitle>
            <CardDescription className="text-sm">
              All contributions and payouts in chronological order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="contribution">Contributions</TabsTrigger>
                <TabsTrigger value="payout">Payouts</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-3">
                {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry) => (
                    <div
                      key={`${entry.type}-${entry.id}`}
                      className={`p-4 rounded-lg border transition-all ${
                        entry.type === 'contribution'
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-accent/5 border-accent/20'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                              entry.type === 'contribution'
                                ? 'bg-primary/20'
                                : 'bg-accent/20'
                            }`}
                          >
                            {entry.type === 'contribution' ? (
                              <DollarSign className="h-5 w-5 text-primary" />
                            ) : (
                              <TrendingUp className="h-5 w-5 text-accent" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold">{entry.memberName}</p>
                              <Badge
                                variant={entry.type === 'contribution' ? 'default' : 'secondary'}
                                className={entry.type === 'contribution' ? 'bg-primary' : 'bg-accent'}
                              >
                                {entry.type === 'contribution' ? 'Contribution' : 'Payout'}
                              </Badge>
                              {entry.isLate && (
                                <Badge variant="destructive" className="text-xs">
                                  Late
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(entry.date).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              <span>Cycle {entry.cycle}</span>
                              {entry.paymentMethod && (
                                <span>via {entry.paymentMethod}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ${entry.amount.toFixed(2)}
                          </p>
                          <Badge
                            variant="outline"
                            className={
                              entry.status === 'paid' || entry.status === 'completed'
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300'
                                : ''
                            }
                          >
                            {entry.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No {activeTab === 'all' ? 'transactions' : activeTab + 's'} recorded yet</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GroupLedger;
