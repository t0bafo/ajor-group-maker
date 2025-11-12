import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SendNotificationParams {
  type: "contribution_reminder" | "payout_notification" | "member_activity" | "group_created" | "welcome_email" | "join_request" | "request_approved" | "member_invited";
  recipientEmail: string;
  recipientName: string;
  recipientPhone?: string;
  channel?: "email" | "sms" | "both";
  data: {
    groupName?: string;
    amount?: number;
    cycleLabel?: string;
    dueDate?: string;
    memberName?: string;
    activityType?: "joined" | "left";
    contributionAmount?: number;
    frequency?: string;
    numberOfMembers?: number;
    inviteCode?: string;
    memberEmail?: string;
    joinMessage?: string;
    requestedAt?: string;
    hostName?: string;
    welcomeMessage?: string;
    inviteLink?: string;
  };
}

export const useNotification = () => {
  /**
   * Fetches user notification preferences and phone number
   * Returns the appropriate channel and phone number for notifications
   */
  const getUserNotificationSettings = async (recipientEmail: string, notificationType: string) => {
    try {
      // Find user by email (check members table)
      const { data: memberData } = await supabase
        .from('members')
        .select('user_id')
        .eq('email', recipientEmail)
        .maybeSingle();

      if (!memberData?.user_id) {
        console.log('No user_id found for email:', recipientEmail);
        return { channel: 'email' as const, phone: undefined };
      }

      // Fetch notification preferences and phone from profiles
      const [preferencesResult, profileResult] = await Promise.all([
        supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', memberData.user_id)
          .maybeSingle(),
        supabase
          .from('profiles')
          .select('phone')
          .eq('id', memberData.user_id)
          .maybeSingle()
      ]);

      const preferences = preferencesResult.data;
      const phone = profileResult.data?.phone;

      // If no preferences found, default to email only
      if (!preferences) {
        console.log('No notification preferences found, defaulting to email only');
        return { channel: 'email' as const, phone };
      }

      // Determine channel based on notification type and preferences
      const emailEnabled = preferences.email_notifications && 
        (notificationType === 'contribution_reminder' ? preferences.contribution_reminders :
         notificationType === 'payout_notification' ? preferences.payout_notifications :
         notificationType === 'member_activity' ? preferences.member_activity :
         true);

      const smsEnabled = preferences.sms_notifications && phone &&
        (notificationType === 'contribution_reminder' ? preferences.sms_contribution_reminders :
         notificationType === 'payout_notification' ? preferences.sms_payout_notifications :
         notificationType === 'member_activity' ? preferences.sms_member_activity :
         true);

      let channel: "email" | "sms" | "both";
      if (emailEnabled && smsEnabled) {
        channel = 'both';
      } else if (smsEnabled) {
        channel = 'sms';
      } else {
        channel = 'email';
      }

      console.log('Notification settings for', recipientEmail, ':', { channel, hasPhone: !!phone });
      return { channel, phone };
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      return { channel: 'email' as const, phone: undefined };
    }
  };

  const sendNotification = async (params: SendNotificationParams) => {
    try {
      // If channel and phone aren't explicitly provided, fetch user preferences
      let finalParams = { ...params };
      
      if (!params.channel || !params.recipientPhone) {
        const settings = await getUserNotificationSettings(params.recipientEmail, params.type);
        finalParams.channel = params.channel || settings.channel;
        finalParams.recipientPhone = params.recipientPhone || settings.phone;
      }

      console.log('Sending notification:', {
        type: finalParams.type,
        email: finalParams.recipientEmail,
        channel: finalParams.channel,
        hasPhone: !!finalParams.recipientPhone
      });

      const { data, error } = await supabase.functions.invoke("send-notification", {
        body: finalParams,
      });

      if (error) {
        console.error("Error sending notification:", error);
        throw error;
      }

      console.log("Notification sent successfully:", data);
      return data;
    } catch (error: any) {
      console.error("Failed to send notification:", error);
      toast.error("Failed to send notification");
      throw error;
    }
  };

  return { sendNotification };
};
