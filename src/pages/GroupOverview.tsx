import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, DollarSign, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import JoinSuccessModal from "@/components/JoinSuccessModal";

const GroupOverview = () => {
  const navigate = useNavigate();
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [agreed, setAgreed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const storedInfo = sessionStorage.getItem("joinGroupInfo");
    if (storedInfo) {
      setGroupInfo(JSON.parse(storedInfo));
    } else {
      toast({
        title: "No Group Selected",
        description: "Please enter an invite code first",
        variant: "destructive",
      });
      navigate("/join-group");
    }
  }, [navigate]);

  const handleConfirmJoin = () => {
    if (!agreed) {
      toast({
        title: "Agreement Required",
        description: "Please confirm that you agree to the rotation and contribution schedule",
        variant: "destructive",
      });
      return;
    }

    // Simulate joining the group
    const memberData = {
      id: Date.now(),
      name: "New Member",
      email: "newmember@example.com",
      role: "Member",
      joinedAt: new Date().toISOString(),
    };

    // Store member data
    sessionStorage.setItem("currentMember", JSON.stringify(memberData));
    sessionStorage.setItem("currentGroup", JSON.stringify(groupInfo));
    
    setShowSuccess(true);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    navigate("/group-dashboard");
  };

  if (!groupInfo) {
    return null;
  }

  const nextPayout = new Date(groupInfo.nextPayoutDate);
  const totalPayout = parseFloat(groupInfo.contributionAmount) * parseInt(groupInfo.numberOfMembers);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-8 md:py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/join-group")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Review Group Details
          </h1>
          <p className="text-muted-foreground text-lg">
            Make sure you understand the commitment before joining
          </p>
        </div>

        {/* Group Summary */}
        <Card className="shadow-[var(--shadow-medium)] mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-1">{groupInfo.groupName}</CardTitle>
                <CardDescription className="text-base">{groupInfo.description}</CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                Active Group
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Details Grid */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Your Contribution</p>
                    <p className="text-2xl font-bold">${groupInfo.contributionAmount}</p>
                    <p className="text-sm text-muted-foreground capitalize">{groupInfo.frequency}</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Next Payout</p>
                    <p className="text-2xl font-bold">
                      {nextPayout.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                    <p className="text-sm text-muted-foreground">${totalPayout} total</p>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Group Size</p>
                    <p className="text-2xl font-bold">{groupInfo.currentMembers + 1}/{groupInfo.numberOfMembers}</p>
                    <p className="text-sm text-muted-foreground">After you join</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Rotation Details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-lg">Rotation & Payout Details</h3>
              </div>
              <div className="bg-accent/10 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Rotation Order:</span>{" "}
                  <span className="capitalize">{groupInfo.rotationOrder}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium">Hosted by:</span> {groupInfo.hostName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Each member contributes ${groupInfo.contributionAmount} {groupInfo.frequency}. 
                  The full ${totalPayout} is paid out to one member per cycle in {groupInfo.rotationOrder} order.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agreement Section */}
        <Card className="shadow-[var(--shadow-medium)] mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="agreement" 
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <label 
                  htmlFor="agreement" 
                  className="text-sm font-medium leading-relaxed cursor-pointer"
                >
                  I agree to the rotation and contribution schedule. I understand that I must 
                  contribute ${groupInfo.contributionAmount} {groupInfo.frequency} and will receive 
                  my payout when it's my turn in the rotation.
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate("/join-group")}
          >
            Cancel
          </Button>
          <Button
            variant="hero"
            size="lg"
            className="flex-1"
            onClick={handleConfirmJoin}
            disabled={!agreed}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Confirm & Join
          </Button>
        </div>
      </div>

      <JoinSuccessModal 
        open={showSuccess} 
        onOpenChange={setShowSuccess}
        groupName={groupInfo.groupName}
        onContinue={handleSuccessClose}
      />
    </div>
  );
};

export default GroupOverview;
