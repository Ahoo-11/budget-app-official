import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getSupabaseAdmin } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";

const handler = async (req: Request): Promise<Response> => {
  console.log('Starting accept-invitation function execution');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    console.log('Processing invitation acceptance for token:', token);

    if (!token) {
      throw new Error('Token is required');
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Get the invitation
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      console.error('Error fetching invitation:', invitationError);
      throw new Error('Invalid or expired invitation');
    }

    console.log('Found valid invitation for email:', invitation.email);

    // Create source permission
    if (invitation.source_id) {
      const { error: permissionError } = await supabaseAdmin
        .from('source_permissions')
        .insert({
          user_id: invitation.user_id,
          source_id: invitation.source_id,
          can_view: true,
          can_create: invitation.role !== 'viewer',
          can_edit: invitation.role !== 'viewer',
          can_delete: invitation.role === 'admin' || invitation.role === 'super_admin'
        });

      if (permissionError) {
        console.error('Error creating source permission:', permissionError);
        throw new Error('Failed to set source permissions');
      }
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
      console.error('Error updating invitation status:', updateError);
      throw new Error('Failed to update invitation status');
    }

    console.log('Successfully completed invitation acceptance process');
    return new Response(
      JSON.stringify({ 
        message: 'Invitation accepted successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in accept-invitation function:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to accept invitation',
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