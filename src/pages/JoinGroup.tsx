import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Users, DollarSign, Calendar, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const JoinGroup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteFromUrl = searchParams.get("code") || "";
  
  const [inviteCode, setInviteCode] = useState(inviteFromUrl);
  const [groupInfo, setGroupInfo] = useState<any>(null);

  // Mock group data - in real app this would come from backend
  const mockGroups: { [key: string]: any } = {
    "abc123xyz": {
      id: "abc123xyz",
      groupName: "Friday Squad",
      description: "Weekly savings with the crew",
      contributionAmount: "100",
      frequency: "weekly",
      numberOfMembers: "6",
      rotationOrder: "sequential",
      hostName: "Sarah Johnson",
      hostEmail: "sarah@example.com",
      currentMembers: 4,
      nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    "xyz789abc": {
      id: "xyz789abc",
      groupName: "Monthly Circle",
      description: "Building wealth together monthly",
      contributionAmount: "250",
      frequency: "monthly",
      numberOfMembers: "8",
      rotationOrder: "sequential",
      hostName: "Michael Chen",
      hostEmail: "michael@example.com",
      currentMembers: 5,
      nextPayoutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  };

  const handleVerifyCode = () => {
    const trimmedCode = inviteCode.trim();
    
    if (!trimmedCode) {
      toast({
        title: "Enter Invite Code",
        description: "Please enter a valid invite code",
        variant: "destructive",
      });
      return;
    }

    const group = mockGroups[trimmedCode];
    
    if (group) {
      setGroupInfo(group);
      toast({
        title: "Group Found!",
        description: `You're invited to join ${group.groupName}`,
      });
    } else {
      toast({
        title: "Invalid Code",
        description: "This invite code doesn't exist. Please check and try again.",
        variant: "destructive",
      });
    }
  };

  const handleJoinGroup = () => {
    if (!groupInfo) return;
    
    // Store invite info for the overview page
    sessionStorage.setItem("joinGroupInfo", JSON.stringify(groupInfo));
    navigate("/join/overview");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-8 md:py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <Card className="shadow-[var(--shadow-medium)]">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
              <Users className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl">Join an Ajor Group</CardTitle>
            <CardDescription className="text-base">
              Enter your invite code to view group details and join
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="inviteCode">Invite Code</Label>
              <div className="flex gap-2">
                <Input
                  id="inviteCode"
                  placeholder="Enter invite code (e.g., abc123xyz)"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                  className="text-base font-mono"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleVerifyCode();
                  }}
                />
                <Button onClick={handleVerifyCode} className="shrink-0">
                  Verify
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Try: abc123xyz or xyz789abc
              </p>
            </div>

            {groupInfo && (
              <div className="animate-fade-in space-y-4">
                <div className="h-px bg-border"></div>
                
                <div className="bg-secondary/50 rounded-xl p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{groupInfo.groupName}</h3>
                      <p className="text-sm text-muted-foreground">{groupInfo.description}</p>
                    </div>
                    <Badge variant="secondary" className="ml-2">
                      {groupInfo.currentMembers}/{groupInfo.numberOfMembers} Members
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Contribution</p>
                        <p className="font-semibold">${groupInfo.contributionAmount}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Frequency</p>
                        <p className="font-semibold capitalize">{groupInfo.frequency}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 col-span-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Hosted by</p>
                        <p className="font-semibold">{groupInfo.hostName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={handleJoinGroup}
                >
                  Join This Ajor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Only join groups with people you trust. Make sure you understand 
            the contribution schedule and rotation order before joining.
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinGroup;
