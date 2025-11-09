import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bell, Mail, DollarSign, Users, History, Loader2 } from "lucide-react";
import AppNavigation from "@/components/AppNavigation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface NotificationHistoryItem {
  id: string;
  type: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  status: string;
  metadata: any;
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
}

const NotificationHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationHistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        navigate("/auth");
        return;
      }

      setUser(currentUser);

      const { data, error } = await supabase
        .from('notification_history')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('sent_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setNotifications(data || []);
    } catch (error: any) {
      console.error('Error loading notification history:', error);
      toast({
        title: "Error",
        description: "Failed to load notification history",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contribution_reminder':
        return <Bell className="h-4 w-4 text-primary" />;
      case 'payout_notification':
        return <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'member_activity':
        return <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'contribution_reminder':
        return 'Contribution Reminder';
      case 'payout_notification':
        return 'Payout Notification';
      case 'member_activity':
        return 'Member Activity';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="default">Sent</Badge>;
      case 'delivered':
        return <Badge variant="default" className="bg-green-600">Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30">
        <AppNavigation 
          userEmail={user?.email} 
          userName={user?.user_metadata?.full_name}
        />
        <div className="container max-w-6xl mx-auto px-4 py-8">
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
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Notification History</h1>
          <p className="text-muted-foreground">
            View all email notifications sent to you
          </p>
        </div>

        <Card className="shadow-[var(--shadow-medium)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Recent Notifications
            </CardTitle>
            <CardDescription>
              Last 50 email notifications sent to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
                <p className="text-muted-foreground">
                  You haven't received any email notifications yet
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Subject</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Sent</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notifications.map((notification) => (
                        <TableRow key={notification.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(notification.type)}
                              <span className="text-sm">{getTypeLabel(notification.type)}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {notification.subject}
                          </TableCell>
                          <TableCell>{getStatusBadge(notification.status)}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(notification.sent_at), 'MMM d, yyyy h:mm a')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                  {notifications.map((notification) => (
                    <Card key={notification.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(notification.type)}
                            <span className="text-sm font-medium">
                              {getTypeLabel(notification.type)}
                            </span>
                          </div>
                          {getStatusBadge(notification.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm font-medium">{notification.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(notification.sent_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NotificationHistory;
