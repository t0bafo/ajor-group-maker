import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AppNavigation from "@/components/AppNavigation";
import { User, Mail, Calendar, Bell, Shield, Crown, Users, PlayCircle, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useOnboarding } from "@/hooks/useOnboarding";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState<string>("+1");
  const [groupStats, setGroupStats] = useState({
    totalGroups: 0,
    hostedGroups: 0,
    memberGroups: 0,
  });

  const { resetOnboarding } = useOnboarding(user?.id);

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
    
    // Load phone from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone')
      .eq('id', session.user.id)
      .maybeSingle();
    
    const fullPhone = profile?.phone || session.user.user_metadata?.phone || "";
    
    // Parse country code from full phone if available
    if (fullPhone && fullPhone.startsWith('+')) {
      const match = fullPhone.match(/^(\+\d+)\s*/);
      if (match) {
        setCountryCode(match[1]);
        setPhone(fullPhone.substring(match[0].length).trim());
      } else {
        setPhone(fullPhone);
      }
    } else {
      setPhone(fullPhone);
    }
    
    await loadGroupStats(session.user.id);
    setIsLoading(false);
  };

  const loadGroupStats = async (userId: string) => {
    try {
      // Get hosted groups (excluding archived)
      const { count: hostedCount, error: hostedError } = await supabase
        .from('groups')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', userId)
        .eq('archived', false);

      if (hostedError) throw hostedError;

      // Get member groups where user is approved member (excluding archived groups)
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('group_id, groups!inner(archived)')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .eq('groups.archived', false);

      if (memberError) throw memberError;

      const memberCount = memberData?.length || 0;
      const hosted = hostedCount || 0;

      setGroupStats({
        totalGroups: hosted + memberCount,
        hostedGroups: hosted,
        memberGroups: memberCount,
      });
    } catch (error) {
      console.error('Error loading group stats:', error);
    }
  };

  const validatePhone = (phoneNumber: string, code: string): boolean => {
    if (!phoneNumber) return true; // Phone is optional
    
    // Remove all non-digit characters for validation
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // Must be 7-15 digits
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      return false;
    }
    
    return true;
  };

  const formatPhoneInput = (value: string): string => {
    // Allow only digits, spaces, and dashes
    let formatted = value.replace(/[^\d\s-]/g, '');
    return formatted;
  };

  const getFullPhoneNumber = (): string => {
    if (!phone) return "";
    return `${countryCode} ${phone}`;
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    // Validate phone if provided
    if (phone && !validatePhone(phone, countryCode)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid phone number",
        variant: "destructive",
      });
      return;
    }

    setIsUpdating(true);
    try {
      const fullPhone = getFullPhoneNumber();
      
      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName, phone: fullPhone }
      });

      if (authError) throw authError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          full_name: fullName,
          phone: fullPhone || null 
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

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

  const handleReplayTour = async () => {
    try {
      await resetOnboarding();
      toast({
        title: "Onboarding Tour Reset",
        description: "Navigate to your dashboard to see the tour again",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
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
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number (for SMS notifications)
                </Label>
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
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                    placeholder="234 567 8900"
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your phone number for SMS notifications and group coordination
                </p>
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
                onClick={handleReplayTour}
              >
                <PlayCircle className="mr-2 h-4 w-4" />
                Replay Onboarding Tour
              </Button>
              <Separator />
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
