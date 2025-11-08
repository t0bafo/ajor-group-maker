import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Users, DollarSign, Calendar, TrendingUp, Plus, Crown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AppNavigation from "@/components/AppNavigation";
import InviteMembersModal from "@/components/InviteMembersModal";
import EmptyState from "@/components/EmptyState";
import { DashboardSkeleton } from "@/components/SkeletonLoader";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<{ name: string; code: string } | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    // Check authentication and load user-specific data
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        loadUserGroups(session.user.id);
        setIsLoading(false);
        
        // Show welcome toast
        toast({
          title: `Welcome back!`,
          description: "Ready to continue saving together?",
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        // Clear sessionStorage on signout
        sessionStorage.clear();
        navigate("/auth");
      } else if (event === "SIGNED_IN" && session) {
        setUser(session.user);
        loadUserGroups(session.user.id);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadUserGroups = async (userId: string) => {
    try {
      // Get groups where user is host (including archived status)
      const { data: hostedGroups, error: hostError } = await supabase
        .from('groups')
        .select('*')
        .eq('host_id', userId);

      if (hostError) throw hostError;

      // Store host group IDs for easy lookup
      const hostedGroupIds = new Set(hostedGroups?.map(g => g.id) || []);

      // Get groups where user is a member (including archived status)
      const { data: memberGroups, error: memberError } = await supabase
        .from('members')
        .select('group_id, groups(*)')
        .eq('user_id', userId);

      if (memberError) throw memberError;

      // Combine and deduplicate groups
      const allGroups = [
        ...(hostedGroups || []),
        ...(memberGroups?.map(m => m.groups).filter(Boolean) || [])
      ];
      
      // Remove duplicates based on group id
      const uniqueGroups = Array.from(
        new Map(allGroups.map(g => [g.id, g])).values()
      );
      
      const groups = uniqueGroups;

      if (groups && groups.length > 0) {
        const formattedGroups = await Promise.all(groups.map(async (group: any) => {
          const isHost = hostedGroupIds.has(group.id);
          // Get member count
          const { count: memberCount } = await supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          // Get contribution progress
          const { count: contributionCount } = await supabase
            .from('contributions')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          const { count: payoutCount } = await supabase
            .from('payouts')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          const expectedContributions = memberCount || 1;
          const progress = expectedContributions > 0 ? ((contributionCount || 0) / expectedContributions) * 100 : 0;

          return {
            id: group.id,
            groupName: group.group_name,
            description: group.description,
            contributionAmount: group.contribution_amount,
            frequency: group.frequency,
            numberOfMembers: group.number_of_members,
            memberCount: memberCount || 0,
            totalMembers: group.number_of_members,
            progress: Math.min(progress, 100),
            status: payoutCount === memberCount ? "Completed" : "Active",
            nextPayout: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { 
              month: "short", 
              day: "numeric" 
            }),
            inviteCode: group.invite_code,
            archived: group.archived || false,
            isHost,
          };
        }));

        setUserGroups(formattedGroups);
      } else {
        setUserGroups([]);
      }
    } catch (error: any) {
      console.error('Error loading groups:', error);
      toast({
        title: "Error loading groups",
        description: error.message,
        variant: "destructive",
      });
      setUserGroups([]);
    }
  };

  const handleInviteMembers = (groupName: string, inviteCode: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setSelectedGroup({ name: groupName, code: inviteCode });
    setInviteModalOpen(true);
  };

  // Filter groups based on archived status
  const filteredGroups = userGroups.filter(group => 
    showArchived ? group.archived : !group.archived
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <AppNavigation userEmail={user?.email} userName={user?.user_metadata?.full_name} />
        <main className="container mx-auto px-4 py-12 md:py-16">
          <div className="max-w-6xl mx-auto">
            <DashboardSkeleton />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <AppNavigation 
        userEmail={user?.email} 
        userName={user?.user_metadata?.full_name}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Welcome Section */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              {userGroups.length > 0 ? "Your Dashboard" : "Welcome to Ajor"}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              {userGroups.length > 0 
                ? "Manage your savings groups and track your progress" 
                : "Start saving together with your trusted community"}
            </p>
          </div>

          {/* Active/Archived Groups or Empty State */}
          {userGroups.length > 0 ? (
            <>
              {/* Summary Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="shadow-[var(--shadow-medium)] border-border/50">
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-base">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Total Savings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      ${userGroups.reduce((sum, g) => sum + (parseFloat(g.contributionAmount) * g.memberCount), 0).toFixed(0)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="shadow-[var(--shadow-medium)] border-border/50">
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-base">
                      <Users className="h-5 w-5 text-accent" />
                      Active Groups
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{userGroups.length}</div>
                  </CardContent>
                </Card>
                <Card className="shadow-[var(--shadow-medium)] border-border/50">
                  <CardHeader className="pb-3">
                    <CardDescription className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-5 w-5 text-emerald" />
                      Total Members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {userGroups.reduce((sum, g) => sum + g.memberCount, 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Groups List */}
              <div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-semibold">
                      {showArchived ? "Archived Ajors" : "Your Ajors"}
                    </h2>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowArchived(!showArchived)}
                    >
                      {showArchived ? "Show Active" : "Show Archived"}
                      {!showArchived && userGroups.filter(g => g.archived).length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {userGroups.filter(g => g.archived).length}
                        </Badge>
                      )}
                    </Button>
                  </div>
                  {!showArchived && (
                    <Button onClick={() => navigate("/group-setup")} size="sm" className="w-full sm:w-auto">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create New
                    </Button>
                  )}
                </div>
                <div className="grid gap-4">
                  {filteredGroups.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">
                        {showArchived 
                          ? "No archived groups yet" 
                          : "No active groups"}
                      </p>
                    </Card>
                  ) : (
                    filteredGroups.map((group) => (
                    <Card 
                      key={group.id}
                      className="hover:shadow-[var(--shadow-large)] hover:-translate-y-1 transition-all duration-300 cursor-pointer border-gold/10 animate-fade-in group"
                      onClick={() => {
                        // Store current group ID for the group dashboard
                        sessionStorage.setItem("currentGroupId", group.id);
                        navigate("/group-dashboard");
                      }}
                    >
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                              <CardTitle className="text-lg sm:text-xl">{group.groupName}</CardTitle>
                              {group.isHost ? (
                                <Badge className="bg-primary/20 text-primary border-primary/30">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Host
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-muted/50">
                                  Member
                                </Badge>
                              )}
                              {group.archived && (
                                <Badge variant="outline" className="bg-muted">
                                  Archived
                                </Badge>
                              )}
                              {!group.archived && (
                                <Badge variant={group.status === "Active" ? "default" : "secondary"} className={group.status === "Active" ? "bg-emerald/20 text-emerald" : ""}>
                                  {group.status}
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="text-sm">{group.description}</CardDescription>
                          </div>
                          {!group.archived && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gold/20 hover:bg-gold/10 w-full sm:w-auto"
                              onClick={(e) => handleInviteMembers(group.groupName, group.inviteCode, e)}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              Invite
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Contribution</p>
                              <p className="font-semibold">${group.contributionAmount}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Frequency</p>
                              <p className="font-semibold capitalize">{group.frequency}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Members</p>
                              <p className="font-semibold">{group.memberCount}/{group.totalMembers}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm text-muted-foreground">Next Payout</p>
                              <p className="font-semibold">{group.nextPayout}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Cycle Progress</span>
                            <span className="font-medium">{Math.round(group.progress)}%</span>
                          </div>
                          <Progress value={group.progress} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="mt-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Create New Ajor */}
                <Card className="hover:shadow-[var(--shadow-medium)] transition-all cursor-pointer group" onClick={() => navigate("/group-setup")}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UserPlus className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">Create New Ajor</CardTitle>
                    <CardDescription>
                      Start a new rotating savings group with friends, family, or trusted colleagues
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="hero" className="w-full">
                      Create Group
                    </Button>
                  </CardContent>
                </Card>

                {/* Join Existing Ajor */}
                <Card className="hover:shadow-[var(--shadow-medium)] transition-all cursor-pointer group" onClick={() => navigate("/join-group")}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Users className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">Join Existing Ajor</CardTitle>
                    <CardDescription>
                      Join a savings group using an invitation code from your group host
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      Join Group
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 bg-gradient-to-r from-primary/5 via-accent/5 to-secondary/10 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-2">
                    You don't have any groups yet
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Start your first Ajor or join an existing group to begin saving together
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Invite Members Modal */}
      {selectedGroup && (
        <InviteMembersModal
          open={inviteModalOpen}
          onOpenChange={setInviteModalOpen}
          groupName={selectedGroup.name}
          inviteCode={selectedGroup.code}
        />
      )}
    </div>
  );
};

export default Dashboard;
