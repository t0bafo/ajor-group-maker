import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Member {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  position: number | null;
}

interface Contribution {
  id: string;
  member_id: string;
  amount: number;
  paid_at: string | null;
  cycle: number;
  status: string;
}

interface Cycle {
  id: string;
  cycle_number: number;
  start_date: string;
  end_date: string;
  payout_recipient_id: string;
}

interface Group {
  id: string;
  group_name: string;
  contribution_amount: number;
  frequency: string;
  start_date: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting weekly digest send...");

    // Get all active groups
    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select("*")
      .eq("status", "active")
      .not("start_date", "is", null);

    if (groupsError) {
      console.error("Error fetching groups:", groupsError);
      throw groupsError;
    }

    if (!groups || groups.length === 0) {
      console.log("No active groups found");
      return new Response(
        JSON.stringify({ success: true, groupsProcessed: 0, message: "No active groups" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${groups.length} active groups`);
    let digestsSent = 0;

    for (const group of groups as Group[]) {
      try {
        console.log(`Processing group: ${group.group_name}`);

        // Get members
        const { data: members, error: membersError } = await supabase
          .from("members")
          .select("*")
          .eq("group_id", group.id)
          .eq("status", "approved");

        if (membersError || !members || members.length === 0) {
          console.log(`No members found for group ${group.group_name}`);
          continue;
        }

        // Get contributions
        const { data: contributions, error: contribError } = await supabase
          .from("contributions")
          .select("*")
          .eq("group_id", group.id);

        // Get cycles
        const { data: cycles, error: cyclesError } = await supabase
          .from("cycles")
          .select("*")
          .eq("group_id", group.id)
          .order("cycle_number", { ascending: true });

        if (contribError || cyclesError) {
          console.error(`Error fetching data for group ${group.id}:`, contribError || cyclesError);
          continue;
        }

        // Calculate last week's stats
        const lastWeekStart = new Date();
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const lastWeekContributions = (contributions || []).filter(
          (c: Contribution) =>
            c.paid_at && new Date(c.paid_at) >= lastWeekStart && c.status === "paid"
        );

        const lastWeekStats = {
          totalPaid: lastWeekContributions.length,
          totalMembers: members.length,
          totalAmount: group.contribution_amount * (members.length - 1), // Exclude payout recipient
          avgPaymentTime: calculateAvgPaymentTime(lastWeekContributions, cycles || []),
        };

        // Calculate leaderboard (fastest payers)
        const leaderboard = calculateLeaderboard(contributions || [], members as Member[]);

        // Get current cycle
        const now = new Date();
        const currentCycle = (cycles || []).find((c: Cycle) => {
          const start = new Date(c.start_date);
          const end = new Date(c.end_date);
          return start <= now && end >= now;
        });

        const payoutRecipient = currentCycle
          ? members.find((m: Member) => m.id === currentCycle.payout_recipient_id)
          : null;

        // Send digest to each member
        for (const member of members as Member[]) {
          if (!member.email) continue;

          const personalContributions = (contributions || []).filter(
            (c: Contribution) => c.member_id === member.id && c.status === "paid"
          );

          const personalStats = {
            contributedSoFar: personalContributions.length * group.contribution_amount,
            payoutWeek: member.position || 1,
            daysUntilPayout: calculateDaysUntilPayout(member.position || 1, cycles || [], group),
            paymentStreak: calculateStreak(personalContributions, cycles || []),
          };

          const dashboardLink = `${supabaseUrl.replace('.supabase.co', '')}/group-dashboard`;

          // Send notification
          const notificationResponse = await supabase.functions.invoke("send-notification", {
            body: {
              type: "weekly_digest",
              recipientEmail: member.email,
              recipientName: member.name,
              channel: "email",
              data: {
                groupName: group.group_name,
                lastWeekStats,
                personalStats,
                leaderboard: leaderboard.slice(0, 5), // Top 5
                thisWeek: {
                  payoutRecipient: payoutRecipient?.name || "TBD",
                  cycleNumber: currentCycle?.cycle_number || 1,
                  dueDate: currentCycle?.end_date
                    ? new Date(currentCycle.end_date).toLocaleDateString()
                    : "TBD",
                },
                dashboardLink,
              },
            },
          });

          if (notificationResponse.error) {
            console.error(
              `Error sending digest to ${member.email}:`,
              notificationResponse.error
            );
          } else {
            digestsSent++;
            console.log(`Digest sent to ${member.email}`);
          }
        }
      } catch (groupError) {
        console.error(`Error processing group ${group.id}:`, groupError);
        continue;
      }
    }

    console.log(`Weekly digest completed. Sent ${digestsSent} emails to ${groups.length} groups`);

    return new Response(
      JSON.stringify({
        success: true,
        groupsProcessed: groups.length,
        digestsSent,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Weekly digest error:", error);
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

// Helper Functions

function calculateAvgPaymentTime(contributions: Contribution[], cycles: Cycle[]): string {
  if (contributions.length === 0) return "N/A";

  let totalHours = 0;
  let count = 0;

  for (const contrib of contributions) {
    const cycle = cycles.find((c) => c.cycle_number === contrib.cycle);
    if (cycle && contrib.paid_at) {
      const cycleStart = new Date(cycle.start_date);
      const paidAt = new Date(contrib.paid_at);
      const hours = (paidAt.getTime() - cycleStart.getTime()) / (1000 * 60 * 60);
      if (hours >= 0) {
        totalHours += hours;
        count++;
      }
    }
  }

  if (count === 0) return "N/A";
  const avgHours = totalHours / count;

  if (avgHours < 24) {
    return `${avgHours.toFixed(1)} hours`;
  } else {
    return `${(avgHours / 24).toFixed(1)} days`;
  }
}

function calculateLeaderboard(contributions: Contribution[], members: Member[]): any[] {
  const memberStats: { [key: string]: { name: string; avgTime: number; count: number } } = {};

  for (const contrib of contributions) {
    if (contrib.status !== "paid" || !contrib.paid_at) continue;

    const member = members.find((m) => m.id === contrib.member_id);
    if (!member) continue;

    const paidAt = new Date(contrib.paid_at);
    const hours = paidAt.getHours() + paidAt.getMinutes() / 60;

    if (!memberStats[member.id]) {
      memberStats[member.id] = { name: member.name, avgTime: 0, count: 0 };
    }
    memberStats[member.id].avgTime += hours;
    memberStats[member.id].count++;
  }

  const leaderboard = Object.values(memberStats)
    .map((stat) => ({
      name: stat.name,
      avgTime: stat.count > 0 ? stat.avgTime / stat.count : 999,
      paymentTime: stat.count > 0 ? `${(stat.avgTime / stat.count).toFixed(1)}h avg` : "No data",
    }))
    .sort((a, b) => a.avgTime - b.avgTime)
    .map((item, index) => ({
      name: item.name,
      rank: index + 1,
      paymentTime: item.paymentTime,
    }));

  return leaderboard;
}

function calculateDaysUntilPayout(
  payoutPosition: number,
  cycles: Cycle[],
  group: Group
): number {
  const now = new Date();
  const payoutCycle = cycles.find((c) => c.cycle_number === payoutPosition);

  if (!payoutCycle) {
    // Estimate based on frequency
    const cyclesUntilPayout = payoutPosition - 1;
    const startDate = new Date(group.start_date);
    let daysPerCycle = 7; // weekly

    if (group.frequency === "biweekly") daysPerCycle = 14;
    if (group.frequency === "monthly") daysPerCycle = 30;

    const estimatedPayoutDate = new Date(startDate);
    estimatedPayoutDate.setDate(estimatedPayoutDate.getDate() + cyclesUntilPayout * daysPerCycle);

    return Math.ceil((estimatedPayoutDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  const payoutDate = new Date(payoutCycle.end_date);
  return Math.ceil((payoutDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateStreak(contributions: Contribution[], cycles: Cycle[]): number {
  if (contributions.length === 0) return 0;

  const sortedContribs = contributions
    .filter((c) => c.status === "paid")
    .sort((a, b) => b.cycle - a.cycle);

  if (sortedContribs.length === 0) return 0;

  let streak = 0;
  let expectedCycle = sortedContribs[0].cycle;

  for (const contrib of sortedContribs) {
    if (contrib.cycle === expectedCycle) {
      streak++;
      expectedCycle--;
    } else {
      break;
    }
  }

  return streak;
}
