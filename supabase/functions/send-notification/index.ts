import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
import React from "https://esm.sh/react@18.3.1";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.22";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { ContributionReminderEmail } from "./_templates/contribution-reminder.tsx";
import { PayoutNotificationEmail } from "./_templates/payout-notification.tsx";
import { MemberActivityEmail } from "./_templates/member-activity.tsx";
import { GroupCreatedEmail } from "./_templates/group-created.tsx";
import { WelcomeEmail } from "./_templates/welcome-email.tsx";
import { JoinRequestEmail } from "./_templates/join-request.tsx";
import { RequestApprovedEmail } from "./_templates/request-approved.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const notificationSchema = z.object({
  type: z.enum(['contribution_reminder', 'payout_notification', 'member_activity', 'group_created', 'welcome_email', 'join_request', 'request_approved']),
  recipientEmail: z.string().email().max(255),
  recipientName: z.string().trim().min(1).max(100),
  data: z.object({
    groupName: z.string().trim().max(100).optional(),
    amount: z.number().positive().max(1000000).optional(),
    cycleLabel: z.string().max(50).optional(),
    dueDate: z.string().max(100).optional(),
    memberName: z.string().trim().max(100).optional(),
    activityType: z.enum(['joined', 'left']).optional(),
    contributionAmount: z.number().positive().max(1000000).optional(),
    frequency: z.string().max(50).optional(),
    numberOfMembers: z.number().int().positive().max(100).optional(),
    inviteCode: z.string().length(9).optional(),
    customMessage: z.string().max(500).optional(),
    memberEmail: z.string().email().max(255).optional(),
    joinMessage: z.string().max(500).optional(),
    requestedAt: z.string().max(100).optional(),
    hostName: z.string().trim().max(100).optional(),
    welcomeMessage: z.string().max(300).optional(),
  }),
});

interface NotificationRequest {
  type: "contribution_reminder" | "payout_notification" | "member_activity" | "group_created" | "welcome_email" | "join_request" | "request_approved";
  recipientEmail: string;
  recipientName: string;
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
    customMessage?: string;
    memberEmail?: string;
    joinMessage?: string;
    requestedAt?: string;
    hostName?: string;
    welcomeMessage?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    
    // Validate input
    const validationResult = notificationSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid input', 
          details: validationResult.error.errors 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { type, recipientEmail, recipientName, data }: NotificationRequest = validationResult.data;

    let html: string;
    let subject: string;

    // Render appropriate email template based on notification type
    switch (type) {
      case "contribution_reminder":
        html = await renderAsync(
          React.createElement(ContributionReminderEmail, {
            recipientName,
            groupName: data.groupName!,
            amount: data.amount!,
            cycleLabel: data.cycleLabel!,
            dueDate: data.dueDate!,
          })
        );
        subject = `Reminder: ${data.cycleLabel} contribution due`;
        break;

      case "payout_notification":
        html = await renderAsync(
          React.createElement(PayoutNotificationEmail, {
            recipientName,
            groupName: data.groupName!,
            amount: data.amount!,
            cycleLabel: data.cycleLabel!,
          })
        );
        subject = `Your payout for ${data.cycleLabel} is ready!`;
        break;

      case "member_activity":
        html = await renderAsync(
          React.createElement(MemberActivityEmail, {
            recipientName,
            groupName: data.groupName!,
            memberName: data.memberName!,
            activityType: data.activityType!,
          })
        );
        subject = `${data.memberName} ${data.activityType === "joined" ? "joined" : "left"} ${data.groupName}`;
        break;

      case "group_created":
        html = await renderAsync(
          React.createElement(GroupCreatedEmail, {
            recipientName,
            groupName: data.groupName!,
            contributionAmount: data.contributionAmount!,
            frequency: data.frequency!,
            numberOfMembers: data.numberOfMembers!,
            inviteCode: data.inviteCode!,
          })
        );
        subject = `Your Ajor group "${data.groupName}" has been created!`;
        break;

      case "welcome_email":
        html = await renderAsync(
          React.createElement(WelcomeEmail, {
            recipientName,
          })
        );
        subject = "Welcome to Ajor - Let's get started!";
        break;

      case "join_request":
        html = await renderAsync(
          React.createElement(JoinRequestEmail, {
            recipientName,
            groupName: data.groupName!,
            memberName: data.memberName!,
            memberEmail: data.memberEmail!,
            joinMessage: data.joinMessage,
            requestedAt: data.requestedAt!,
          })
        );
        subject = `New join request for ${data.groupName}`;
        break;

      case "request_approved":
        html = await renderAsync(
          React.createElement(RequestApprovedEmail, {
            recipientName,
            groupName: data.groupName!,
            hostName: data.hostName!,
            welcomeMessage: data.welcomeMessage,
            contributionAmount: data.contributionAmount!,
            frequency: data.frequency!,
          })
        );
        subject = `Welcome to ${data.groupName}! Your request was approved`;
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    // Send email using Resend
    const { error } = await resend.emails.send({
      from: "Ajor <onboarding@resend.dev>",
      to: [recipientEmail],
      subject,
      html,
    });

    if (error) {
      throw new Error("Failed to send email");
    }

    // Log to notification history
    try {
      // Try to find user by email
      const { data: userData } = await supabase
        .from('members')
        .select('user_id')
        .eq('email', recipientEmail)
        .maybeSingle();

      if (userData?.user_id) {
        await supabase
          .from('notification_history')
          .insert({
            user_id: userData.user_id,
            type,
            recipient_email: recipientEmail,
            recipient_name: recipientName,
            subject,
            status: 'sent',
            metadata: data,
          });
      }
    } catch (historyError) {
      // Don't fail the request if history logging fails
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Failed to send notification" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
