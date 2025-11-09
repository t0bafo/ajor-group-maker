import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppNavigation from "@/components/AppNavigation";
import { User, Mail, Calendar, Bell, Shield, Crown, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [groupStats, setGroupStats] = useState({
    totalGroups: 0,
    hostedGroups: 0,
    memberGroups: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    
    setUser(session.user);
    setFullName(session.user.user_metadata?.full_name || "");
    await loadGroupStats(session.user.id);
    setIsLoading(false);
  };

  const loadGroupStats = async (userId: string) => {
    try {
      // Get hosted groups
      const { data: hostedGroups } = await supabase
        .from('groups')
        .select('id', { count: 'exact', head: true })
        .eq('host_id', userId)
        .eq('archived', false);

      // Get member groups
      const { data: memberGroups } = await supabase
        .from('members')
        .select('group_id', { count: 'exact', head: true })
        .eq('user_id', userId);

      const hosted = hostedGroups?.length || 0;
      const member = memberGroups?.length || 0;

      setGroupStats({
        totalGroups: hosted + member,
        hostedGroups: hosted,
        memberGroups: member,
      });
    } catch (error) {
      console.error('Error loading group stats:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      });

      // Refresh user data
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
        <AppNavigation />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.charAt(0).toUpperCase() || 'U';

  const joinDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString("en-US", { 
        month: "long", 
        year: "numeric" 
      })
    : "Unknown";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      <AppNavigation 
        userEmail={user?.email} 
        userName={user?.user_metadata?.full_name}
      />

      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              My Profile
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Overview Card */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <CardTitle className="text-2xl">{fullName || "User"}</CardTitle>
                  <CardDescription className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </CardDescription>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Member since {joinDate}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Account Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="shadow-[var(--shadow-medium)]">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Total Groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{groupStats.totalGroups}</div>
              </CardContent>
            </Card>
            <Card className="shadow-[var(--shadow-medium)]">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-accent" />
                  Hosting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{groupStats.hostedGroups}</div>
              </CardContent>
            </Card>
            <Card className="shadow-[var(--shadow-medium)]">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-2">
                  <User className="h-4 w-4 text-emerald" />
                  Member Of
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{groupStats.memberGroups}</div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Settings */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and display name
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>
              <Button 
                onClick={handleUpdateProfile} 
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                {isUpdating ? "Updating..." : "Update Profile"}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-[var(--shadow-medium)]">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/notification-preferences")}
              >
                <Bell className="mr-2 h-4 w-4" />
                Notification Preferences
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/notification-history")}
              >
                <Mail className="mr-2 h-4 w-4" />
                Notification History
              </Button>
              <Separator />
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/privacy")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Privacy Policy
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/terms")}
              >
                <Shield className="mr-2 h-4 w-4" />
                Terms of Service
              </Button>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="shadow-[var(--shadow-medium)] border-gold/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Account Status</p>
                  <p className="text-xs text-muted-foreground">
                    Your account is active and in good standing
                  </p>
                </div>
                <Badge className="bg-emerald/20 text-emerald border-emerald/30">
                  Active
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
