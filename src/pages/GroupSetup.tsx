import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import StepIndicator from "@/components/StepIndicator";
import CulturalTooltip from "@/components/CulturalTooltip";
import { celebrationConfetti } from "@/lib/confetti";
import { groupSchema } from "@/lib/validation";

const GroupSetup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
    contributionAmount: "",
    frequency: "",
    numberOfMembers: "",
    rotationOrder: "sequential",
  });

  const steps = ["Basic Info", "Financial Details", "Rotation Setup"];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Step-by-step validation
    if (currentStep === 0) {
      if (!formData.groupName) {
        toast({
          title: "Group Name Required",
          description: "Please enter a name for your Ajor group",
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(1);
      return;
    }
    
    if (currentStep === 1) {
      // Validate with zod
      const validationResult = groupSchema.safeParse({
        groupName: formData.groupName,
        contributionAmount: parseFloat(formData.contributionAmount),
        numberOfMembers: parseInt(formData.numberOfMembers),
        description: formData.description || undefined
      });

      if (!validationResult.success) {
        toast({
          title: "Validation Error",
          description: validationResult.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
      setCurrentStep(2);
      return;
    }
    
    // Final step - create group
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create a group",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Generate invite code
      const { data: inviteCodeData } = await supabase.rpc('generate_invite_code');
      const inviteCode = inviteCodeData || Math.random().toString(36).substring(2, 11);

      // Create group in database
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          host_id: user.id,
          group_name: formData.groupName,
          description: formData.description,
          contribution_amount: parseFloat(formData.contributionAmount),
          frequency: formData.frequency,
          number_of_members: parseInt(formData.numberOfMembers),
          rotation_order: formData.rotationOrder,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add host as first member
      const { error: memberError } = await supabase
        .from('members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Host',
          email: user.email || '',
          role: 'Host',
          position: 1,
        });

      if (memberError) throw memberError;

      // Store group ID for next page
      sessionStorage.setItem("currentGroupId", group.id);
      
      // Celebration confetti!
      celebrationConfetti();
      
      toast({
        title: "🎉 Your Ajor is Ready!",
        description: "Time to invite your trusted circle",
      });

      // Navigate to invite members page
      setTimeout(() => {
        navigate("/invite-members");
      }, 1200);
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast({
        title: "Error Creating Group",
        description: error.message || "Failed to create group",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 py-8 md:py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <StepIndicator steps={steps} currentStep={currentStep} />

        <Card className="shadow-[var(--shadow-medium)] mt-8">
          <CardHeader>
            <CardTitle className="text-3xl">Create Your Ajor Group</CardTitle>
            <CardDescription className="text-base">
              {currentStep === 0 && "Start by naming your savings circle"}
              {currentStep === 1 && "Set contribution amount and schedule"}
              {currentStep === 2 && "Choose how payouts will be distributed"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 0 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name *</Label>
                    <Input
                      id="groupName"
                      placeholder="e.g., Friday Squad, Monthly Circle"
                      value={formData.groupName}
                      onChange={(e) => handleInputChange("groupName", e.target.value)}
                      className="text-base"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the purpose or goals of this group"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      rows={3}
                      className="text-base resize-none"
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="contributionAmount">Contribution Amount *</Label>
                      <Input
                        id="contributionAmount"
                        type="number"
                        placeholder="$100"
                        value={formData.contributionAmount}
                        onChange={(e) => handleInputChange("contributionAmount", e.target.value)}
                        className="text-base"
                        autoFocus
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency *</Label>
                      <Select 
                        value={formData.frequency} 
                        onValueChange={(value) => handleInputChange("frequency", value)}
                      >
                        <SelectTrigger id="frequency" className="text-base">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numberOfMembers">Number of Members *</Label>
                    <Input
                      id="numberOfMembers"
                      type="number"
                      placeholder="5"
                      min="2"
                      max="20"
                      value={formData.numberOfMembers}
                      onChange={(e) => handleInputChange("numberOfMembers", e.target.value)}
                      className="text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 2 members, maximum 20 members
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="rotationOrder">Rotation Order *</Label>
                      <CulturalTooltip content="Traditional rotation order determines payout sequence — inspired by the 'ajo/susu' system where each member takes turns receiving the collective pool." />
                    </div>
                    <Select 
                      value={formData.rotationOrder} 
                      onValueChange={(value) => handleInputChange("rotationOrder", value)}
                    >
                      <SelectTrigger id="rotationOrder" className="text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sequential">Sequential</SelectItem>
                        <SelectItem value="random">Random</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {formData.rotationOrder === "sequential" 
                        ? "Members receive payouts in a fixed order based on when they joined" 
                        : "Members are selected randomly for each payout cycle"}
                    </p>
                  </div>

                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                    <h4 className="font-semibold mb-2">Summary</h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Group:</span> {formData.groupName}</p>
                      <p><span className="text-muted-foreground">Contribution:</span> ${formData.contributionAmount} {formData.frequency}</p>
                      <p><span className="text-muted-foreground">Members:</span> {formData.numberOfMembers}</p>
                      <p><span className="text-muted-foreground">Total Pool:</span> ${Number(formData.contributionAmount) * Number(formData.numberOfMembers)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {currentStep > 0 && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                )}
                <Button 
                  type="submit" 
                  variant={currentStep === 2 ? "hero" : "default"}
                  size="lg" 
                  className="flex-1"
                >
                  {currentStep === 2 ? "Create Ajor" : "Next"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-gradient-to-r from-accent/10 via-gold/5 to-accent/10 rounded-lg border border-gold/20">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> As the host, you'll automatically manage this group. 
            You can add a co-host later if needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupSetup;
