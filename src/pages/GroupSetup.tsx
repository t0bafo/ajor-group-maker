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

const GroupSetup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    groupName: "",
    description: "",
    contributionAmount: "",
    frequency: "",
    numberOfMembers: "",
    rotationOrder: "sequential",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.groupName || !formData.contributionAmount || !formData.frequency || !formData.numberOfMembers) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Store group data in sessionStorage for demo purposes
    sessionStorage.setItem("ajorGroup", JSON.stringify(formData));
    
    toast({
      title: "Group Created Successfully!",
      description: "Let's add members to your Ajor group",
    });

    // Navigate to invite members page
    setTimeout(() => {
      navigate("/invite-members");
    }, 800);
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

        <Card className="shadow-[var(--shadow-medium)]">
          <CardHeader>
            <CardTitle className="text-3xl">Create Your Ajor Group</CardTitle>
            <CardDescription className="text-base">
              Set up a rotating savings group with trusted friends and family
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="groupName">Group Name *</Label>
                <Input
                  id="groupName"
                  placeholder="e.g., Friday Squad, Monthly Circle"
                  value={formData.groupName}
                  onChange={(e) => handleInputChange("groupName", e.target.value)}
                  className="text-base"
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

              <div className="grid md:grid-cols-2 gap-6">
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rotationOrder">Rotation Order</Label>
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
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Create Ajor
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> As the host, you'll automatically be assigned to manage this group. 
            You can add a co-host later if needed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupSetup;
