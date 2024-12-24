import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getSupabaseAdmin } from "../_shared/supabase-admin.ts";
import { corsHeaders } from "../_shared/cors.ts";

const handler = async (req: Request): Promise<Response> => {
  console.log('Starting accept-invitation function execution');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token, password } = await req.json();
    console.log('Processing invitation acceptance for token:', token);

    if (!token || !password) {
      throw new Error('Token and password are required');
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

    // Create the user
    const { data: { user }, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
      email: invitation.email,
      password: password,
      email_confirm: true
    });

    if (createUserError || !user) {
      console.error('Error creating user:', createUserError);
      throw new Error('Failed to create user account');
    }

    console.log('Created user account for:', user.email);

    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      throw new Error('Failed to create user profile');
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
      throw new Error('Failed to set user role');
    }

    // Create source permission if source_id exists
    if (invitation.source_id) {
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

    console.log('Successfully completed user creation process');
    return new Response(
      JSON.stringify({ 
        message: 'Account created successfully',
        email: invitation.email
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
        error: 'Failed to create account',
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