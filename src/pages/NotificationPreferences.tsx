import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Mail, DollarSign, Users, Loader2 } from "lucide-react";
import AppNavigation from "@/components/AppNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const NotificationPreferences = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    contribution_reminders: true,
    payout_notifications: true,
    member_activity: true,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        navigate("/auth");
        return;
      }

      setUser(currentUser);

      // Load existing preferences or create defaults
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', currentUser.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications,
          contribution_reminders: data.contribution_reminders,
          payout_notifications: data.payout_notifications,
          member_activity: data.member_activity,
        });
      } else {
        // Create default preferences
        const { error: insertError } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: currentUser.id,
            email_notifications: true,
            contribution_reminders: true,
            payout_notifications: true,
            member_activity: true,
          });

        if (insertError) throw insertError;
      }
    } catch (error: any) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id',
        });

      if (error) throw error;

      toast({
        title: "Preferences Saved",
        description: "Your notification preferences have been updated",
      });
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
        <AppNavigation 
          userEmail={user?.email} 
          userName={user?.user_metadata?.full_name}
        />
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
      <AppNavigation 
        userEmail={user?.email} 
        userName={user?.user_metadata?.full_name}
      />
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
          <p className="text-muted-foreground">
            Manage how you receive notifications from your Ajor groups
          </p>
        </div>

        <Card className="shadow-[var(--shadow-medium)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Email Notifications
            </CardTitle>
            <CardDescription>
              Control which email notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications" className="text-base font-semibold">
                  <Mail className="inline h-4 w-4 mr-2" />
                  All Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable all email notifications
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.email_notifications}
                onCheckedChange={() => handleToggle('email_notifications')}
              />
            </div>

            <Separator />

            {/* Individual Notification Types */}
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 hover:bg-secondary/10 rounded-lg transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="contribution-reminders" className="text-base">
                    <Bell className="inline h-4 w-4 mr-2 text-primary" />
                    Contribution Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get reminded 2-3 days before your contribution is due
                  </p>
                </div>
                <Switch
                  id="contribution-reminders"
                  checked={preferences.contribution_reminders}
                  onCheckedChange={() => handleToggle('contribution_reminders')}
                  disabled={!preferences.email_notifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-secondary/10 rounded-lg transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="payout-notifications" className="text-base">
                    <DollarSign className="inline h-4 w-4 mr-2 text-green-600 dark:text-green-400" />
                    Payout Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Be notified when it's your turn to receive a payout
                  </p>
                </div>
                <Switch
                  id="payout-notifications"
                  checked={preferences.payout_notifications}
                  onCheckedChange={() => handleToggle('payout_notifications')}
                  disabled={!preferences.email_notifications}
                />
              </div>

              <div className="flex items-center justify-between p-4 hover:bg-secondary/10 rounded-lg transition-colors">
                <div className="space-y-0.5">
                  <Label htmlFor="member-activity" className="text-base">
                    <Users className="inline h-4 w-4 mr-2 text-blue-600 dark:text-blue-400" />
                    Member Activity
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get updates when members join or leave your groups
                  </p>
                </div>
                <Switch
                  id="member-activity"
                  checked={preferences.member_activity}
                  onCheckedChange={() => handleToggle('member_activity')}
                  disabled={!preferences.email_notifications}
                />
              </div>
            </div>

            <Separator />

            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationPreferences;
