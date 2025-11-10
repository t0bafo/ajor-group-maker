import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Invite code validation schema
const inviteCodeSchema = z.string()
  .trim()
  .length(9, { message: "Invite code must be 9 characters" })
  .regex(/^[a-z0-9]+$/, { message: "Invalid code format" });

// Rate limiting function
const checkRateLimit = async (supabase: any, ipAddress: string): Promise<boolean> => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  
  // Count recent attempts
  const { count, error: countError } = await supabase
    .from('rate_limit')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ipAddress)
    .eq('endpoint', 'validate-invite')
    .gte('created_at', tenMinutesAgo.toISOString());
  
  if (countError) {
    // On error, fail open (allow request) to avoid blocking legitimate users
    return true;
  }
  
  if (count && count >= 10) {
    return false;
  }
  
  // Log this attempt
  const { error: insertError } = await supabase
    .from('rate_limit')
    .insert({
      ip_address: ipAddress,
      endpoint: 'validate-invite',
    });
  
  
  return true;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Extract IP address from headers
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                      req.headers.get('x-real-ip') || 
                      'unknown';

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Check rate limit
    const allowed = await checkRateLimit(supabaseAdmin, ipAddress);
    if (!allowed) {
      return new Response(
        JSON.stringify({ 
          error: "Too many attempts. Please try again in 10 minutes." 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const { inviteCode } = await req.json();

    // Validate invite code format
    const validationResult = inviteCodeSchema.safeParse(inviteCode);
    
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({ error: validationResult.error.errors[0].message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Look up group by invite code
    const { data: group, error: groupError } = await supabaseAdmin
      .from("groups")
      .select("id, group_name, description, contribution_amount, frequency, number_of_members, rotation_order, status, start_date")
      .eq("invite_code", validationResult.data)
      .eq("status", "active")
      .single();

    if (groupError || !group) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired invite code" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if group has already started
    if (group.start_date) {
      return new Response(
        JSON.stringify({ error: "This Ajor has already started and is no longer accepting new members" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
    return new Response(
      JSON.stringify({ error: "Failed to validate invite code" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
