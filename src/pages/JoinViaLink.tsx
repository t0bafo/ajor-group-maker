import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Users, DollarSign, Calendar, User, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const JoinViaLink = () => {
  const navigate = useNavigate();
  const { code } = useParams();
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadGroupFromCode = async () => {
      if (!code) {
        setError(true);
        setLoading(false);
        toast({
          title: "Invalid Link",
          description: "This invite link is incomplete",
          variant: "destructive",
        });
        return;
      }

      try {
        // Look up group by invite code
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('*')
          .eq('invite_code', code)
          .single();

        if (groupError || !group) {
          setError(true);
          toast({
            title: "Invalid or Expired Link",
            description: "This invite link doesn't exist. Please check with your host.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Get member count
        const { count: memberCount } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id);

        // Get host info
        const { data: host } = await supabase
          .from('members')
          .select('name, email')
          .eq('group_id', group.id)
          .eq('role', 'Host')
          .single();

        setGroupInfo({
          id: group.id,
          groupName: group.group_name,
          description: group.description,
          contributionAmount: group.contribution_amount,
          frequency: group.frequency,
          numberOfMembers: group.number_of_members,
          rotationOrder: group.rotation_order,
          hostName: host?.name || 'Unknown',
          hostEmail: host?.email || '',
          currentMembers: memberCount || 0,
          nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        });

        setLoading(false);
      } catch (err: any) {
        console.error('Error loading group:', err);
        setError(true);
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to load group details",
          variant: "destructive",
        });
      }
    };

    loadGroupFromCode();
  }, [code]);

  const handleJoinGroup = async () => {
    if (!groupInfo) return;
    
    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Store group info and redirect to auth
      sessionStorage.setItem("joinGroupInfo", JSON.stringify(groupInfo));
      sessionStorage.setItem("returnToJoin", "true");
      navigate("/auth");
      return;
    }
    
    // User is authenticated, proceed to join
    sessionStorage.setItem("joinGroupInfo", JSON.stringify(groupInfo));
    navigate("/group-overview");
  };

  const handleEnterCodeManually = () => {
    navigate("/join-group");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (error || !groupInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-accent/5 py-8 md:py-12">
        <div className="container max-w-2xl mx-auto px-4">
          <Card className="shadow-[var(--shadow-elegant)] border-destructive/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-destructive">Invalid Invite Link</CardTitle>
              <CardDescription>
                This link doesn't exist or has expired. Please check with your group host.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleEnterCodeManually}
              >
                Enter Code Manually
              </Button>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate("/dashboard")}
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-accent/5 py-8 md:py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")}
          className="mb-6 hover:bg-gold/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-[var(--shadow-elegant)] border-gold/20 backdrop-blur-sm animate-fade-in">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-primary/80 flex items-center justify-center mb-4 shadow-[var(--shadow-glow)] animate-scale-in">
              <Users className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold">You're Invited!</CardTitle>
            <CardDescription className="text-base mt-2">
              Join this trusted savings circle and start building wealth together
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gradient-to-br from-concrete/30 to-concrete/10 border border-gold/20 rounded-xl p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-1">{groupInfo.groupName}</h3>
                  {groupInfo.description && (
                    <p className="text-sm text-muted-foreground">{groupInfo.description}</p>
                  )}
                </div>
                <Badge variant="secondary" className="ml-2 bg-gold/10 border-gold/20">
                  {groupInfo.currentMembers}/{groupInfo.numberOfMembers} Members
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Contribution</p>
                    <p className="font-bold text-lg">${groupInfo.contributionAmount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Frequency</p>
                    <p className="font-bold capitalize">{groupInfo.frequency}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 col-span-2">
                  <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-emerald" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hosted by</p>
                    <p className="font-bold">{groupInfo.hostName}</p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              variant="hero" 
              size="lg" 
              className="w-full text-lg h-14 shadow-[var(--shadow-soft)]"
              onClick={handleJoinGroup}
            >
              Join This Ajor
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="text-center pt-2">
              <button
                onClick={handleEnterCodeManually}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline"
              >
                Have a join code instead?
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-gradient-to-r from-accent/10 via-gold/5 to-accent/10 rounded-lg border border-gold/20">
          <p className="text-sm text-muted-foreground text-center">
            <strong className="text-foreground">Note:</strong> Only join groups with people you trust. Make sure you understand 
            the contribution schedule and rotation order before joining.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinViaLink;
