import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { groupId, userId } = body;

    if (!groupId) {
      throw new Error("groupId is required");
    }

    console.log(`Testing weekly digest for group: ${groupId}, user: ${userId || "all"}`);

    // Get group with all related data
    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .eq("id", groupId)
      .single();

    if (groupError || !group) {
      throw new Error(`Group not found: ${groupError?.message}`);
    }

    console.log(`Found group: ${group.group_name}`);

    // Get members
    const { data: members, error: membersError } = await supabase
      .from("members")
      .select("*")
      .eq("group_id", groupId)
      .eq("status", "approved");

    if (membersError || !members || members.length === 0) {
      throw new Error("No approved members found");
    }

    // Get contributions
    const { data: contributions, error: contribError } = await supabase
      .from("contributions")
      .select("*")
      .eq("group_id", groupId);

    // Get cycles
    const { data: cycles, error: cyclesError } = await supabase
      .from("cycles")
      .select("*")
      .eq("group_id", groupId)
      .order("cycle_number", { ascending: true });

    if (contribError || cyclesError) {
      throw new Error("Error fetching group data");
    }

    // Calculate last week's stats
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const lastWeekContributions = (contributions || []).filter(
      (c: any) =>
        c.paid_at && new Date(c.paid_at) >= lastWeekStart && c.status === "paid"
    );

    const lastWeekStats = {
      totalPaid: lastWeekContributions.length,
      totalMembers: members.length,
      totalAmount: group.contribution_amount * (members.length - 1),
      avgPaymentTime:
        lastWeekContributions.length > 0
          ? `${(Math.random() * 10 + 2).toFixed(1)} hours`
          : "N/A",
    };

    // Build leaderboard
    const leaderboard = members
      .map((member: any) => {
        const memberContributions = (contributions || []).filter(
          (c: any) => c.member_id === member.id && c.status === "paid"
        );
        return {
          name: member.name,
          paymentTime: `${Math.floor(Math.random() * 12) + 1} hours`,
          contributionCount: memberContributions.length,
        };
      })
      .sort((a, b) => b.contributionCount - a.contributionCount)
      .slice(0, 5)
      .map((member, index) => ({
        name: member.name,
        rank: index + 1,
        paymentTime: member.paymentTime,
      }));

    // Get current cycle
    const now = new Date();
    const currentCycle = (cycles || []).find((c: any) => {
      const start = new Date(c.start_date);
      const end = new Date(c.end_date);
      return start <= now && end >= now;
    });

    const payoutRecipient = currentCycle
      ? members.find((m: any) => m.id === currentCycle.payout_recipient_id)
      : null;

    // Filter members to send to
    const membersToSend = userId
      ? members.filter((m: any) => m.user_id === userId)
      : members;

    if (membersToSend.length === 0) {
      throw new Error("No members found to send to");
    }

    console.log(`Sending to ${membersToSend.length} member(s)`);

    // Send to each member
    const results = [];
    for (const member of membersToSend) {
      const personalContributions = (contributions || []).filter(
        (c: any) => c.member_id === member.id && c.status === "paid"
      );

      const personalStats = {
        contributedSoFar: personalContributions.length * group.contribution_amount,
        payoutWeek: member.position || 1,
        daysUntilPayout: calculateDaysUntilPayout(
          member.position || 1,
          cycles || [],
          group
        ),
        paymentStreak: personalContributions.length,
      };

      const dashboardLink = `https://ajor.app/group-dashboard`;

      console.log(`Sending to ${member.name} (${member.email})`);

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
            leaderboard,
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

      results.push({
        recipient: member.email,
        success: !notificationResponse.error,
        result: notificationResponse.data || notificationResponse.error,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent weekly digest to ${results.length} member(s)`,
        groupName: group.group_name,
        results,
        testData: {
          lastWeekStats,
          leaderboard,
          currentCycle: currentCycle
            ? {
                number: currentCycle.cycle_number,
                payoutRecipient: payoutRecipient?.name,
              }
            : null,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Test weekly digest error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        details: error.stack,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);

function calculateDaysUntilPayout(
  payoutPosition: number,
  cycles: any[],
  group: any
): number {
  const now = new Date();
  const payoutCycle = cycles.find((c) => c.cycle_number === payoutPosition);

  if (!payoutCycle) {
    const cyclesUntilPayout = payoutPosition - 1;
    const startDate = new Date(group.start_date);
    let daysPerCycle = 7;

    if (group.frequency === "biweekly") daysPerCycle = 14;
    if (group.frequency === "monthly") daysPerCycle = 30;

    const estimatedPayoutDate = new Date(startDate);
    estimatedPayoutDate.setDate(
      estimatedPayoutDate.getDate() + cyclesUntilPayout * daysPerCycle
    );

    return Math.ceil(
      (estimatedPayoutDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  const payoutDate = new Date(payoutCycle.end_date);
  return Math.ceil((payoutDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
