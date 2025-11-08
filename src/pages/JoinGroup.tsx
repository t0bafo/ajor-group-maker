import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Users, DollarSign, Calendar, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { inviteCodeSchema } from "@/lib/validation";

const JoinGroup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteFromUrl = searchParams.get("code") || "";
  
  const [inviteCode, setInviteCode] = useState(inviteFromUrl);
  const [groupInfo, setGroupInfo] = useState<any>(null);


  const handleVerifyCode = async () => {
    const trimmedCode = inviteCode.trim();
    
    // Validate invite code format with zod
    const validationResult = inviteCodeSchema.safeParse(trimmedCode);
    
    if (!validationResult.success) {
      toast({
        title: "Invalid Code Format",
        description: validationResult.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    // Check if user is authenticated
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Store the code and redirect to auth
      sessionStorage.setItem("pendingInviteCode", trimmedCode);
      navigate("/auth");
      return;
    }

    try {
      // Use edge function to validate invite code and get group info
      const { data, error: functionError } = await supabase.functions.invoke('validate-invite', {
        body: { inviteCode: trimmedCode }
      });

      if (functionError || !data || data.error) {
        toast({
          title: "Invalid Code",
          description: data?.error || "This invite code doesn't exist. Please check and try again.",
          variant: "destructive",
        });
        return;
      }

      setGroupInfo({
        ...data,
        nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      toast({
        title: "Group Found!",
        description: `You're invited to join ${data.groupName}`,
      });
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error('Error verifying code:', error);
      }
      toast({
        title: "Error",
        description: "Failed to verify invite code. Please try again.",
        variant: "destructive",
      });
    }
  };

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

        <Card className="shadow-[var(--shadow-elegant)] border-gold/20 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-primary/80 flex items-center justify-center mb-4 shadow-[var(--shadow-glow)] animate-scale-in">
              <Users className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold">Join with a Code</CardTitle>
            <CardDescription className="text-base mt-2">
              Enter your invite code to view group details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="inviteCode" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Enter Code
              </Label>
              <div className="flex gap-2">
                <Input
                  id="inviteCode"
                  placeholder="e.g., abc123xyz"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="text-lg font-mono tracking-wider text-center bg-background/80 border-gold/20"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerifyCode();
                  }}
                />
                <Button 
                  onClick={handleVerifyCode} 
                  className="shrink-0 bg-gradient-to-r from-accent to-primary hover:opacity-90"
                  disabled={!inviteCode.trim()}
                >
                  Verify
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Ask your host for the group code
              </p>
            </div>

            {groupInfo && (
              <div className="animate-fade-in space-y-4">
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                
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
              </div>
            )}
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

export default JoinGroup;
