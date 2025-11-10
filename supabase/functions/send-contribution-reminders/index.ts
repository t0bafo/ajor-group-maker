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
  number_of_members: number;
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

function getNextCycleDate(startDate: string, frequency: string, currentCycle: number): Date {
  const start = new Date(startDate);
  const cycleDate = new Date(start);
  
  switch (frequency) {
    case "weekly":
      cycleDate.setDate(start.getDate() + (currentCycle * 7));
      break;
    case "biweekly":
      cycleDate.setDate(start.getDate() + (currentCycle * 14));
      break;
    case "monthly":
      cycleDate.setMonth(start.getMonth() + currentCycle);
      break;
  }
  
  return cycleDate;
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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Verify CRON_SECRET
  const cronSecret = Deno.env.get("CRON_SECRET");
  const providedSecret = req.headers.get("x-cron-secret");

  if (!cronSecret || providedSecret !== cronSecret) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Get all active groups that have started
    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select("*")
      .eq("status", "active")
      .not("start_date", "is", null);

    if (groupsError) {
      throw groupsError;
    }

    const now = new Date();
    let remindersSent = 0;

    for (const group of groups as Group[]) {
      const currentCycle = getCurrentCycle(group.start_date, group.frequency);
      const nextCycleDate = getNextCycleDate(group.start_date, group.frequency, currentCycle);
      
      // Calculate days until next cycle
      const daysUntilDue = Math.ceil((nextCycleDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Send reminders if 2-3 days before due date
      if (daysUntilDue >= 2 && daysUntilDue <= 3) {
        // Get all members of this group
        const { data: members, error: membersError } = await supabase
          .from("members")
          .select("*")
          .eq("group_id", group.id);

        if (membersError) {
          continue;
        }

        // Get contributions for current cycle
        const { data: contributions, error: contributionsError } = await supabase
          .from("contributions")
          .select("member_id, cycle")
          .eq("group_id", group.id)
          .eq("cycle", currentCycle);

        if (contributionsError) {
          continue;
        }

        const contributedMemberIds = new Set(
          (contributions as Contribution[] || []).map((c) => c.member_id)
        );

        // Send reminders to members who haven't contributed yet
        for (const member of members as Member[]) {
          if (contributedMemberIds.has(member.id)) {
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
              continue;
            }
          }

          // Send reminder email
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
                    dueDate: nextCycleDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }),
                  },
                },
              }
            );

            if (!notificationError) {
              remindersSent++;
            }
          } catch (error) {
            // Continue to next member
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        remindersSent,
        message: `Sent ${remindersSent} contribution reminders`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: "Failed to process reminders" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);
