import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calendar, DollarSign, Users, TrendingUp, CheckCircle2, Phone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import JoinSuccessModal from "@/components/JoinSuccessModal";
import { supabase } from "@/integrations/supabase/client";
import { useNotification } from "@/hooks/useNotification";

const GroupOverview = () => {
  const navigate = useNavigate();
  const { sendNotification } = useNotification();
  const [groupInfo, setGroupInfo] = useState<any>(null);
  const [agreed, setAgreed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [userPhone, setUserPhone] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("+1");
  const [needsPhone, setNeedsPhone] = useState(false);

  useEffect(() => {
    const storedInfo = sessionStorage.getItem("joinGroupInfo");
    if (storedInfo) {
      setGroupInfo(JSON.parse(storedInfo));
      checkUserPhone();
    } else {
      toast({
        title: "No Group Selected",
        description: "Please enter an invite code first",
        variant: "destructive",
      });
      navigate("/join-group");
    }
  }, [navigate]);

  const checkUserPhone = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile?.phone) {
      setNeedsPhone(true);
    }
  };

  const validatePhone = (phoneNumber: string, code: string): boolean => {
    if (!phoneNumber) return false;
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) return false;
    return true;
  };

  const formatPhoneInput = (value: string): string => {
    // Remove all non-digit characters except spaces and dashes
    let formatted = value.replace(/[^\d\s-]/g, '');
    return formatted;
  };

  const getFullPhoneNumber = (): string => {
    return `${countryCode} ${userPhone}`;
  };

  const handleConfirmJoin = async () => {
    if (!agreed) {
      toast({
        title: "Agreement Required",
        description: "Please confirm that you agree to the rotation and contribution schedule",
        variant: "destructive",
      });
      return;
    }

    // Validate phone if needed
    if (needsPhone && !validatePhone(userPhone, countryCode)) {
      toast({
        title: "Phone Number Required",
        description: "Host needs your phone number to coordinate payments",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to join a group",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user is already a member or has pending request
      const { data: existingMember } = await supabase
        .from('members')
        .select('id, status')
        .eq('group_id', groupInfo.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingMember) {
        if (existingMember.status === 'approved') {
          toast({
            title: "Already a Member",
            description: "You're already part of this group",
          });
          sessionStorage.setItem("currentGroupId", groupInfo.id);
          navigate("/group-dashboard");
          return;
        } else if (existingMember.status === 'pending') {
          toast({
            title: "Request Pending",
            description: "Your join request is awaiting approval",
          });
          navigate("/dashboard");
          return;
        } else if (existingMember.status === 'rejected') {
          toast({
            title: "Previous Request Declined",
            description: "Your previous request was not approved. You can submit a new request.",
            variant: "destructive",
          });
          // Allow them to submit a new request by continuing
        }
      }

      // Check if group requires approval
      const { data: groupSettings } = await supabase
        .from('groups')
        .select('auto_approve_members, host_id')
        .eq('id', groupInfo.id)
        .single();

      const requiresApproval = !groupSettings?.auto_approve_members;
      const memberStatus = requiresApproval ? 'pending' : 'approved';

      // Get next position (only count approved members)
      const { count: approvedCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', groupInfo.id)
        .eq('status', 'approved');

      // Add user as member (pending or approved)
      const { error } = await supabase
        .from('members')
        .insert({
          group_id: groupInfo.id,
          user_id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member',
          email: user.email || '',
          role: 'Member',
          position: (approvedCount || 0) + 1,
          status: memberStatus,
          requested_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Save phone if provided
      if (needsPhone && userPhone) {
        await supabase
          .from('profiles')
          .update({ phone: getFullPhoneNumber() })
          .eq('id', user.id);
      }

      if (requiresApproval) {
        // Send join request notification to host
        try {
          // Get host email using database function
          const { data: hostEmail, error: hostError } = await supabase
            .rpc('get_user_email', { _user_id: groupSettings.host_id });
          
          if (hostError) {
            console.error("Error fetching host email:", hostError);
          }

          if (hostEmail) {
            await sendNotification({
              type: "join_request",
              recipientEmail: hostEmail,
              recipientName: groupInfo.hostName,
              data: {
                groupName: groupInfo.groupName,
                memberName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member',
                memberEmail: user.email || '',
                requestedAt: new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              },
            });
          }
        } catch (notifError) {
          console.error("Failed to send join request notification:", notifError);
        }

        toast({
          title: "Request Submitted",
          description: `Your request to join ${groupInfo.groupName} has been sent to ${groupInfo.hostName}`,
        });
        
        // Store the pending status
        sessionStorage.setItem("joinRequestStatus", "pending");
        setShowSuccess(true);
      } else {
        // Auto-approved - send notification to all members
        try {
          const { data: allMembers } = await supabase
            .from('members')
            .select('email, name')
            .eq('group_id', groupInfo.id)
            .eq('status', 'approved');

          if (allMembers && allMembers.length > 0) {
            for (const member of allMembers) {
              if (member.email && member.email !== user.email) {
                await sendNotification({
                  type: "member_activity",
                  recipientEmail: member.email,
                  recipientName: member.name,
                  data: {
                    groupName: groupInfo.groupName,
                    memberName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member',
                    activityType: "joined",
                  },
                });
              }
            }
          }
        } catch (notifError) {
          console.error("Failed to send member join notification:", notifError);
        }

        // Store group ID for dashboard
        sessionStorage.setItem("currentGroupId", groupInfo.id);
        sessionStorage.removeItem("joinRequestStatus");
        setShowSuccess(true);
      }
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast({
        title: "Error Joining Group",
        description: error.message || "Failed to join group",
        variant: "destructive",
      });
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    const isPending = sessionStorage.getItem("joinRequestStatus") === "pending";
    if (isPending) {
      sessionStorage.removeItem("joinRequestStatus");
      navigate("/dashboard");
    } else {
      navigate("/group-dashboard");
    }
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

        {/* Phone Collection */}
        {needsPhone && (
          <Card className="shadow-[var(--shadow-medium)] mb-6">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" />
                  <Label htmlFor="userPhone" className="text-base font-semibold">
                    Host needs your phone number
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Select value={countryCode} onValueChange={setCountryCode}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      <SelectItem value="+1">🇺🇸 +1 (US/CA)</SelectItem>
                      <SelectItem value="+44">🇬🇧 +44 (UK)</SelectItem>
                      <SelectItem value="+234">🇳🇬 +234 (NG)</SelectItem>
                      <SelectItem value="+233">🇬🇭 +233 (GH)</SelectItem>
                      <SelectItem value="+254">🇰🇪 +254 (KE)</SelectItem>
                      <SelectItem value="+27">🇿🇦 +27 (ZA)</SelectItem>
                      <SelectItem value="+91">🇮🇳 +91 (IN)</SelectItem>
                      <SelectItem value="+86">🇨🇳 +86 (CN)</SelectItem>
                      <SelectItem value="+81">🇯🇵 +81 (JP)</SelectItem>
                      <SelectItem value="+61">🇦🇺 +61 (AU)</SelectItem>
                      <SelectItem value="+49">🇩🇪 +49 (DE)</SelectItem>
                      <SelectItem value="+33">🇫🇷 +33 (FR)</SelectItem>
                      <SelectItem value="+39">🇮🇹 +39 (IT)</SelectItem>
                      <SelectItem value="+34">🇪🇸 +34 (ES)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="userPhone"
                    type="tel"
                    placeholder="234 567 8900"
                    value={userPhone}
                    onChange={(e) => setUserPhone(formatPhoneInput(e.target.value))}
                    className="flex-1 text-base"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Required for payment coordination and group communication
                </p>
              </div>
            </CardContent>
          </Card>
        )}

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
        isPending={sessionStorage.getItem("joinRequestStatus") === "pending"}
      />
    </div>
  );
};

export default GroupOverview;
