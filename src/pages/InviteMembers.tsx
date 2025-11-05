import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Mail, Plus, Check, ArrowRight, Users, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { celebrationConfetti } from "@/lib/confetti";

const InviteMembers = () => {
  const navigate = useNavigate();
  const [inviteEmail, setInviteEmail] = useState("");
  const [members, setMembers] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [groupData, setGroupData] = useState<any>(null);
  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    const loadGroupData = async () => {
      const groupId = sessionStorage.getItem("currentGroupId");
      if (!groupId) {
        toast({
          title: "No Group Selected",
          description: "Please create a group first",
          variant: "destructive",
        });
        navigate("/group-setup");
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

        // Fetch existing members
        const { data: membersData, error: membersError } = await supabase
          .from('members')
          .select('*')
          .eq('group_id', groupId)
          .order('position');

        if (membersError) throw membersError;

        setGroupData({
          id: group.id,
          groupName: group.group_name,
          numberOfMembers: group.number_of_members,
          inviteCode: group.invite_code,
        });

        setMembers(membersData.map((m: any) => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
        })));

        // Set invite link
        const baseUrl = window.location.origin;
        setInviteLink(`${baseUrl}/join/${group.invite_code}`);
        
        // Celebration confetti on mount
        setTimeout(() => {
          celebrationConfetti();
        }, 400);
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
  }, [navigate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Share this link with your trusted members",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !groupData) return;

    try {
      // Add member to database
      const { data: newMember, error } = await supabase
        .from('members')
        .insert({
          group_id: groupData.id,
          name: inviteEmail.split("@")[0],
          email: inviteEmail,
          role: "Member",
          position: members.length + 1,
        })
        .select()
        .single();

      if (error) throw error;

      setMembers([...members, {
        id: newMember.id,
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
      }]);
      setInviteEmail("");
      
      toast({
        title: "Invite Sent!",
        description: `Invitation sent to ${inviteEmail}`,
      });
    } catch (error: any) {
      console.error('Error sending invite:', error);
      toast({
        title: "Error Sending Invite",
        description: error.message || "Failed to send invite",
        variant: "destructive",
      });
    }
  };

  const handleContinue = () => {
    navigate("/group-dashboard");
  };

  if (!groupData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleCopyCode = () => {
    if (!groupData?.inviteCode) return;
    navigator.clipboard.writeText(groupData.inviteCode);
    toast({
      title: "✅ Code copied",
      description: "Share it with your circle.",
    });
  };

  const handleShare = async () => {
    if (!inviteLink || !groupData) return;
    
    const shareData = {
      title: `Join ${groupData.groupName} on Ajor`,
      text: `You're invited to join "${groupData.groupName}" — a trusted savings circle. Use code: ${groupData.inviteCode}`,
      url: inviteLink,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled share
      }
    } else {
      // Fallback to copy
      handleCopyLink();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-accent/5 py-8 md:py-12">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Header with celebration */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary via-accent to-primary/80 mb-4 shadow-[var(--shadow-glow-gold)] animate-scale-in relative">
            <Check className="h-12 w-12 text-white" />
            <Sparkles className="h-6 w-6 text-primary absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Your Ajor is Ready! 🎉
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Share your link or code so your trusted circle can join and start saving with you.
          </p>
        </div>

        {/* Main Invite Card - Glassmorphic */}
        <Card className="shadow-[var(--shadow-elegant)] border-gold/20 backdrop-blur-sm bg-concrete/50 mb-8 animate-fade-in">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold">{groupData.groupName}</CardTitle>
            <CardDescription className="text-base">
              Invite your trusted members to begin the savings journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invite Link Section */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Share this link
              </Label>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="font-mono text-sm bg-background/80 border-gold/20"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                  className="shrink-0 border-gold/20 hover:bg-gold/10"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-concrete px-2 text-muted-foreground">Or share this code</span>
              </div>
            </div>

            {/* Join Code Section */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Join Code
              </Label>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-br from-gold/10 to-accent/10 border border-gold/30 flex items-center justify-center">
                  <span className="text-2xl font-bold font-mono tracking-widest text-foreground">
                    {groupData.inviteCode}
                  </span>
                </div>
                <Button
                  onClick={handleCopyCode}
                  variant="outline"
                  size="icon"
                  className="shrink-0 h-auto border-gold/20 hover:bg-gold/10"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handleCopyLink}
                variant="outline"
                className="border-gold/20 hover:bg-gold/10"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Link
              </Button>
              <Button
                onClick={handleShare}
                variant="cta"
                className="bg-gradient-to-r from-accent to-primary"
              >
                <Mail className="mr-2 h-4 w-4" />
                Share via...
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card className="shadow-[var(--shadow-medium)] border-gold/10 mb-6 animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Group Members</CardTitle>
                <CardDescription>
                  {members.length} of {groupData.numberOfMembers || "—"} members joined
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-base px-3 py-1 bg-gold/10 border-gold/20">
                {members.length}/{groupData.numberOfMembers || "—"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No members yet — invite your first few to begin the rotation.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-concrete/30 to-concrete/10 border border-gold/10 hover:border-gold/20 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold">
                        {member.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <Badge variant={member.role === "Host" ? "default" : "outline"} className={member.role === "Host" ? "bg-gold text-gold-foreground" : ""}>
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Tagline */}
        <div className="text-center mb-6">
          <p className="text-sm italic text-muted-foreground">
            "It takes a village to save."
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 border-gold/20"
            onClick={() => navigate("/group-setup")}
          >
            Back to Setup
          </Button>
          <Button
            variant="hero"
            size="lg"
            className="flex-1"
            onClick={handleContinue}
          >
            Continue to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InviteMembers;
