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
  const sendNotification = async (params: SendNotificationParams) => {
    try {
      const { data, error } = await supabase.functions.invoke("send-notification", {
        body: params,
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
