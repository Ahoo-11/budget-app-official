import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { getSupabaseAdmin } from "./supabase-admin.ts";
import { sendInvitationEmail } from "./email-service.ts";
import { corsHeaders, validateRequest } from "./utils.ts";

const handler = async (req: Request): Promise<Response> => {
  console.log('Starting create-user function execution');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, role, sourceId } = await req.json();
    validateRequest(email, role, sourceId);

    const supabaseAdmin = getSupabaseAdmin();

    // Get the current user making the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('No authorization header');
    }

    console.log('Verifying user authorization');
    const { data: { user: invitingUser }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !invitingUser) {
      console.error('Error getting inviting user:', userError);
      throw new Error('Error getting inviting user');
    }

    // Verify the inviting user is a super admin
    console.log('Checking user role');
    const { data: userRole, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', invitingUser.id)
      .single();

    if (roleError) {
      console.error('Error getting user role:', roleError);
      throw new Error('Error getting user role');
    }

    if (userRole.role !== 'super_admin') {
      console.error('Unauthorized: User is not a super admin');
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          details: 'Only super admins can create users'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      );
    }

    // Generate invitation token
    const token = crypto.randomUUID();

    // Handle invitation creation/update
    const { data: existingInvitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (invitationError && invitationError.code !== 'PGRST116') {
      console.error('Error checking existing invitation:', invitationError);
      throw new Error(`Error checking existing invitation: ${invitationError.message}`);
    }

    if (existingInvitation) {
      console.log('Found existing pending invitation, updating it');
      const { error: updateError } = await supabaseAdmin
        .from('invitations')
        .update({
          role,
          invited_by: invitingUser.id,
          updated_at: new Date().toISOString(),
          token,
          source_id: sourceId
        })
        .eq('id', existingInvitation.id);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
        throw new Error(`Error updating invitation: ${updateError.message}`);
      }
    } else {
      console.log('Creating new invitation record');
      const { error: createError } = await supabaseAdmin
        .from('invitations')
        .insert({
          email,
          role,
          invited_by: invitingUser.id,
          status: 'pending',
          token,
          source_id: sourceId
        });

      if (createError) {
        console.error('Error creating invitation:', createError);
        throw new Error(`Error creating invitation record: ${createError.message}`);
      }
    }

    // Send invitation email
    const origin = req.headers.get('origin') || '';
    await sendInvitationEmail(email, role, token, origin);

    console.log('Invitation process completed successfully');
    return new Response(
      JSON.stringify({
        message: 'Invitation sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-user function:', error);
    return new Response(
      JSON.stringify({
        error: 'Error processing invitation',
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