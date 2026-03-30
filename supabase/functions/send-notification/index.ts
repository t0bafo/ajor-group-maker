import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
import React from "https://esm.sh/react@18.2.0";
import { renderAsync } from "https://esm.sh/@react-email/components@0.0.15?deps=react@18.2.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { ContributionReminderEmail } from "./_templates/contribution-reminder.tsx";
import { PayoutNotificationEmail } from "./_templates/payout-notification.tsx";
import { MemberActivityEmail } from "./_templates/member-activity.tsx";
import { GroupCreatedEmail } from "./_templates/group-created.tsx";
import { WelcomeEmail } from "./_templates/welcome-email.tsx";
import { JoinRequestEmail } from "./_templates/join-request.tsx";
import { RequestApprovedEmail } from "./_templates/request-approved.tsx";
import { MemberInvitedEmail } from "./_templates/member-invited.tsx";
import { WeeklyDigestEmail } from "./_templates/weekly-digest.tsx";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Twilio configuration
const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const notificationSchema = z.object({
  type: z.enum(['contribution_reminder', 'payout_notification', 'member_activity', 'group_created', 'welcome_email', 'join_request', 'request_approved', 'member_invited', 'payout_date_set', 'weekly_digest']),
  recipientEmail: z.string().email().max(255),
  recipientName: z.string().trim().min(1).max(100),
  recipientPhone: z.string().optional(),
  channel: z.enum(['email', 'sms', 'both']).default('email'),
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
    inviteLink: z.string().url().max(500).optional(),
    payoutRecipient: z.string().max(100).optional(),
    payoutDate: z.string().max(100).optional(),
    cycleNumber: z.number().int().positive().optional(),
    lastWeekStats: z.any().optional(),
    personalStats: z.any().optional(),
    leaderboard: z.array(z.any()).optional(),
    thisWeek: z.any().optional(),
    dashboardLink: z.string().url().max(500).optional(),
  }),
});

interface NotificationRequest {
  type: "contribution_reminder" | "payout_notification" | "member_activity" | "group_created" | "welcome_email" | "join_request" | "request_approved" | "member_invited" | "payout_date_set" | "weekly_digest";
  recipientEmail: string;
  recipientName: string;
  recipientPhone?: string;
  channel: "email" | "sms" | "both";
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
    inviteLink?: string;
    payoutRecipient?: string;
    payoutDate?: string;
    cycleNumber?: number;
    lastWeekStats?: any;
    personalStats?: any;
    leaderboard?: any[];
    thisWeek?: any;
    dashboardLink?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // TEMPORARY: All notifications disabled
  console.log('Notifications are temporarily disabled');
  return new Response(
    JSON.stringify({ success: true, message: "Notifications temporarily disabled", channels: { email: false, sms: false } }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );

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

    const { type, recipientEmail, recipientName, recipientPhone, channel, data }: NotificationRequest = validationResult.data;

    console.log('Processing notification:', {
      type,
      email: recipientEmail,
      name: recipientName,
      phone: recipientPhone,
      channel,
    });

    let html: string;
    let subject: string;
    let smsMessage: string;

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
        smsMessage = `Hi ${recipientName}, reminder: Your ${data.cycleLabel} contribution of $${data.amount} for ${data.groupName} is due on ${data.dueDate}.`;
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
        smsMessage = `Hi ${recipientName}, great news! Your payout of $${data.amount} for ${data.cycleLabel} in ${data.groupName} is ready.`;
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
        smsMessage = `Hi ${recipientName}, ${data.memberName} ${data.activityType === "joined" ? "joined" : "left"} ${data.groupName}.`;
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
        smsMessage = `Hi ${recipientName}, your Ajor group "${data.groupName}" has been created! Invite code: ${data.inviteCode}`;
        break;

      case "welcome_email":
        html = await renderAsync(
          React.createElement(WelcomeEmail, {
            recipientName,
          })
        );
        subject = "Welcome to Ajor - Let's get started!";
        smsMessage = `Welcome to Ajor, ${recipientName}! Let's get started with your rotating savings groups.`;
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
        smsMessage = `Hi ${recipientName}, ${data.memberName} requested to join ${data.groupName}.`;
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
        smsMessage = `Hi ${recipientName}, welcome to ${data.groupName}! Your join request was approved by ${data.hostName}.`;
        break;

      case "member_invited":
        html = await renderAsync(
          React.createElement(MemberInvitedEmail, {
            recipientName,
            recipientEmail,
            groupName: data.groupName!,
            hostName: data.hostName!,
            contributionAmount: data.contributionAmount!,
            frequency: data.frequency!,
            inviteLink: data.inviteLink!,
            inviteCode: data.inviteCode!,
          })
        );
        subject = `You're invited to join ${data.groupName} on Ajor`;
        smsMessage = `Hi ${recipientName}, ${data.hostName} invited you to join ${data.groupName} on Ajor. Code: ${data.inviteCode}`;
        break;

      case "payout_date_set":
        html = await renderAsync(
          React.createElement(MemberInvitedEmail, {
            recipientName,
            recipientEmail,
            groupName: data.groupName!,
            hostName: data.hostName!,
            contributionAmount: data.amount!,
            frequency: data.frequency!,
            inviteLink: data.inviteLink!,
            inviteCode: data.inviteCode!,
          })
        );
        subject = `Payout Date Set - ${data.groupName}`;
        smsMessage = `${data.groupName}: Payout for ${data.payoutRecipient} set for ${data.payoutDate}. Cycle ${data.cycleNumber}.`;
        break;

      case "weekly_digest":
        html = await renderAsync(
          React.createElement(WeeklyDigestEmail, {
            recipientName,
            groupName: data.groupName || 'your group',
            lastWeekStats: data.lastWeekStats || { totalPaid: 0, totalMembers: 0, totalAmount: 0, avgPaymentTime: 'N/A' },
            personalStats: data.personalStats || { contributedSoFar: 0, payoutWeek: 1, daysUntilPayout: 0, paymentStreak: 0 },
            leaderboard: data.leaderboard || [],
            thisWeek: data.thisWeek || { payoutRecipient: 'TBD', cycleNumber: 1, dueDate: 'TBD' },
            dashboardLink: data.dashboardLink || 'https://ajor.app',
          })
        );
        subject = `Your Weekly Ajor Update - ${data.groupName || 'Group'}`;
        smsMessage = `${data.groupName}: Weekly update available. Check your email for stats and this week's info.`;
        break;

      default:
        throw new Error(`Unknown notification type: ${type}`);
    }

    // Send notifications based on channel
    const results = { email: false, sms: false };

    if (channel === 'email' || channel === 'both') {
      const { error } = await resend.emails.send({
        from: "Ajor <noreply@ajor.app>",
        to: [recipientEmail],
        subject,
        html,
      });

      if (error) {
        console.error("Failed to send email:", error);
      } else {
        results.email = true;
      }
    }

    if ((channel === 'sms' || channel === 'both') && recipientPhone && twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      try {
        console.log('Attempting to send SMS:', {
          to: recipientPhone,
          from: twilioPhoneNumber,
          hasAccountSid: !!twilioAccountSid,
          hasAuthToken: !!twilioAuthToken,
        });

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
        
        const smsResponse = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: recipientPhone,
            From: twilioPhoneNumber,
            Body: smsMessage,
          }),
        });

        const responseText = await smsResponse.text();
        
        if (smsResponse.ok) {
          console.log('SMS sent successfully:', responseText);
          results.sms = true;
        } else {
          console.error('Failed to send SMS - Status:', smsResponse.status);
          console.error('Failed to send SMS - Response:', responseText);
          console.error('Failed to send SMS - Phone:', recipientPhone);
        }
      } catch (smsError: any) {
        console.error('Error sending SMS:', smsError.message);
        console.error('SMS Error stack:', smsError.stack);
      }
    } else if (channel === 'sms' || channel === 'both') {
      // Only log when SMS was intended but couldn't be sent
      console.log('SMS not sent - Missing requirements:', {
        channel,
        hasPhone: !!recipientPhone,
        hasTwilioAccountSid: !!twilioAccountSid,
        hasTwilioAuthToken: !!twilioAuthToken,
        hasTwilioPhoneNumber: !!twilioPhoneNumber,
      });
    }

    if (!results.email && !results.sms) {
      throw new Error("Failed to send notification via any channel");
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
      JSON.stringify({ 
        success: true, 
        message: "Notification sent",
        channels: results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error sending notification:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      type: typeof error,
    });
    return new Response(
      JSON.stringify({ 
        error: "Failed to send notification",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
