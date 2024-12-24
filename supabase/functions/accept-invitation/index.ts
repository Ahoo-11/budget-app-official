import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      throw new Error('Token is required');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get the invitation details
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      console.error('Error getting invitation:', invitationError);
      throw new Error('Invalid or expired invitation');
    }

    // Get the user ID for the email
    const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    const user = users.find(u => u.email === invitation.email);

    if (userError || !user) {
      console.error('Error getting user:', userError);
      throw new Error('User not found');
    }

    // Create user role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: user.id,
        role: invitation.role
      });

    if (roleError) {
      console.error('Error creating user role:', roleError);
      throw new Error('Error creating user role');
    }

    // Create source permission
    const { error: permissionError } = await supabaseAdmin
      .from('source_permissions')
      .insert({
        user_id: user.id,
        source_id: invitation.source_id,
        can_view: true,
        can_create: invitation.role !== 'viewer',
        can_edit: invitation.role !== 'viewer',
        can_delete: invitation.role === 'admin' || invitation.role === 'super_admin'
      });

    if (permissionError) {
      console.error('Error creating source permission:', permissionError);
      throw new Error('Error creating source permission');
    }

    // Update invitation status
    const { error: updateError } = await supabaseAdmin
      .from('invitations')
      .update({
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('token', token);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      throw new Error('Error updating invitation status');
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in accept-invitation function:', error);
    return new Response(
      JSON.stringify({
        error: 'Error accepting invitation',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
};

serve(handler);