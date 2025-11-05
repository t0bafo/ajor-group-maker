import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, Mail, Plus, Check, ArrowRight, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const InviteMembers = () => {
  const navigate = useNavigate();
  const [inviteEmail, setInviteEmail] = useState("");
  const [members, setMembers] = useState([
    { id: 1, name: "You", email: "host@example.com", role: "Host" },
  ]);
  const [copied, setCopied] = useState(false);
  
  const inviteLink = "https://ajor.app/join/abc123xyz";
  
  const groupData = JSON.parse(sessionStorage.getItem("ajorGroup") || "{}");

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast({
      title: "Link Copied!",
      description: "Share this link with your trusted members",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember = {
      id: members.length + 1,
      name: inviteEmail.split("@")[0],
      email: inviteEmail,
      role: "Member",
    };

    setMembers([...members, newMember]);
    setInviteEmail("");
    
    toast({
      title: "Invite Sent!",
      description: `Invitation sent to ${inviteEmail}`,
    });
  };

  const handleContinue = () => {
    sessionStorage.setItem("ajorMembers", JSON.stringify(members));
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-8 md:py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Invite Your Members</h1>
          <p className="text-muted-foreground text-lg">
            Add trusted friends and family to "{groupData.groupName || "your group"}"
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Share Link Card */}
          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="text-xl">Share Invite Link</CardTitle>
              <CardDescription>
                Copy and share this link with your members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Invite Card */}
          <Card className="shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="text-xl">Send Email Invite</CardTitle>
              <CardDescription>
                Invite members directly via email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendInvite} className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="member@example.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" size="icon" className="shrink-0">
                  <Mail className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <Card className="shadow-[var(--shadow-medium)] mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Group Members</CardTitle>
                <CardDescription>
                  {members.length} of {groupData.numberOfMembers || "—"} members added
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {members.length}/{groupData.numberOfMembers || "—"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
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
                  <Badge variant={member.role === "Host" ? "default" : "outline"}>
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
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
