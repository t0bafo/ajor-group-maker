import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.79.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Group {
  id: string;
  group_name: string;
  frequency: string;
  start_date: string;
  contribution_amount: number;
  grace_period_days: number;
}

interface Member {
  id: string;
  name: string;
  email: string;
  user_id: string | null;
}

interface Contribution {
  cycle: number;
  member_id: string;
}

function getDueDateForCycle(startDate: string, frequency: string, cycle: number): Date {
  const start = new Date(startDate);
  const dueDate = new Date(start);
  
  switch (frequency) {
    case "weekly":
      dueDate.setDate(start.getDate() + ((cycle - 1) * 7));
      break;
    case "biweekly":
      dueDate.setDate(start.getDate() + ((cycle - 1) * 14));
      break;
    case "monthly":
      dueDate.setMonth(start.getMonth() + (cycle - 1));
      break;
  }
  
  return dueDate;
}

function getCurrentCycle(startDate: string, frequency: string): number {
  const start = new Date(startDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  switch (frequency) {
    case "weekly":
      return Math.floor(diffDays / 7) + 1;
    case "biweekly":
      return Math.floor(diffDays / 14) + 1;
    case "monthly":
      return Math.floor(diffDays / 30) + 1;
    default:
      return 1;
  }
}

function getDaysOverdue(dueDate: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - dueDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify CRON_SECRET
  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("x-cron-secret");

  if (!cronSecret || providedSecret !== cronSecret) {
    console.error("Unauthorized: Invalid or missing CRON_SECRET");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    console.log("Starting late payment reminder check...");

    // Get all active groups that have started
    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select("*")
      .eq("status", "active")
      .not("start_date", "is", null);

    if (groupsError) {
      console.error("Error fetching groups:", groupsError);
      throw groupsError;
    }

    console.log(`Found ${groups?.length || 0} active groups`);

    const now = new Date();
    let remindersSent = 0;

    for (const group of groups as Group[]) {
      console.log(`Processing group: ${group.group_name}`);
      
      const currentCycle = getCurrentCycle(group.start_date, group.frequency);
      const dueDate = getDueDateForCycle(group.start_date, group.frequency, currentCycle);
      const daysOverdue = getDaysOverdue(dueDate);
      
      console.log(`Group ${group.group_name}: Cycle ${currentCycle}, Days overdue: ${daysOverdue}`);
      
      // Send late payment reminders at specific intervals: Day 0 (due date), Day 3, Day 7
      if (daysOverdue === 0 || daysOverdue === 3 || daysOverdue === 7) {
        // Get all members of this group
        const { data: members, error: membersError } = await supabase
          .from("members")
          .select("*")
          .eq("group_id", group.id);

        if (membersError) {
          console.error(`Error fetching members for group ${group.id}:`, membersError);
          continue;
        }

        // Get contributions for current cycle
        const { data: contributions, error: contributionsError } = await supabase
          .from("contributions")
          .select("member_id, cycle")
          .eq("group_id", group.id)
          .eq("cycle", currentCycle);

        if (contributionsError) {
          console.error(`Error fetching contributions for group ${group.id}:`, contributionsError);
          continue;
        }

        const contributedMemberIds = new Set(
          (contributions as Contribution[] || []).map((c) => c.member_id)
        );

        // Send reminders to members who haven't contributed yet
        for (const member of members as Member[]) {
          if (contributedMemberIds.has(member.id)) {
            console.log(`Member ${member.name} already contributed for cycle ${currentCycle}`);
            continue;
          }

          // Check notification preferences if user_id exists
          if (member.user_id) {
            const { data: prefs } = await supabase
              .from("notification_preferences")
              .select("email_notifications, contribution_reminders")
              .eq("user_id", member.user_id)
              .single();

            if (prefs && (!prefs.email_notifications || !prefs.contribution_reminders)) {
              console.log(`Member ${member.name} has notifications disabled`);
              continue;
            }
          }

          // Determine reminder type based on days overdue
          let reminderMessage = "";
          if (daysOverdue === 0) {
            reminderMessage = "Your contribution is due today!";
          } else if (daysOverdue === 3) {
            reminderMessage = `Your contribution is ${daysOverdue} days overdue. You have ${group.grace_period_days - daysOverdue} day(s) remaining in the grace period.`;
          } else if (daysOverdue === 7) {
            reminderMessage = `Your contribution is ${daysOverdue} days overdue. The grace period has ended.`;
          }

          // Send late payment reminder email
          try {
            const { error: notificationError } = await supabase.functions.invoke(
              "send-notification",
              {
                body: {
                  type: "contribution_reminder",
                  recipientEmail: member.email,
                  recipientName: member.name,
                  data: {
                    groupName: group.group_name,
                    amount: group.contribution_amount,
                    cycleLabel: `Cycle ${currentCycle}`,
                    dueDate: dueDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                    customMessage: reminderMessage,
                  },
                },
              }
            );

            if (notificationError) {
              console.error(`Error sending late reminder to ${member.email}:`, notificationError);
            } else {
              console.log(`Late payment reminder sent to ${member.name} (${member.email}) - ${daysOverdue} days overdue`);
              remindersSent++;
            }
          } catch (error) {
            console.error(`Failed to send late reminder to ${member.email}:`, error);
          }
        }
      }
    }

    console.log(`Late payment reminder check complete. Sent ${remindersSent} reminders.`);

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent,
        message: `Sent ${remindersSent} late payment reminders`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-late-payment-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
