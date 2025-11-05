import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inviteCode } = await req.json();

    if (!inviteCode) {
      return new Response(
        JSON.stringify({ error: "Invite code is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Look up group by invite code
    const { data: group, error: groupError } = await supabaseAdmin
      .from("groups")
      .select("id, group_name, description, contribution_amount, frequency, number_of_members, rotation_order, status")
      .eq("invite_code", inviteCode)
      .eq("status", "active")
      .single();

    if (groupError || !group) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired invite code" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get member count
    const { count: memberCount } = await supabaseAdmin
      .from("members")
      .select("*", { count: "exact", head: true })
      .eq("group_id", group.id);

    // Get host info
    const { data: host } = await supabaseAdmin
      .from("members")
      .select("name, email")
      .eq("group_id", group.id)
      .eq("role", "Host")
      .single();

    // Return limited group information
    return new Response(
      JSON.stringify({
        id: group.id,
        groupName: group.group_name,
        description: group.description,
        contributionAmount: group.contribution_amount,
        frequency: group.frequency,
        numberOfMembers: group.number_of_members,
        rotationOrder: group.rotation_order,
        currentMembers: memberCount || 0,
        hostName: host?.name || "Unknown",
        hostEmail: host?.email || "",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error validating invite:", error);
    return new Response(
      JSON.stringify({ error: "Failed to validate invite code" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
