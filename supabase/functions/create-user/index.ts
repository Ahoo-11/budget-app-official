import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Starting create-user function execution');

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, role, sourceId } = await req.json();
    console.log('Received request payload:', { email, role, sourceId });

    if (!email || !role || !sourceId) {
      console.error('Missing required fields:', { email, role, sourceId });
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          details: 'Email, role, and sourceId are required'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Initialize Supabase client
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

    // Check for existing pending invitation
    console.log('Checking for existing pending invitation');
    const { data: existingInvitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (invitationError && invitationError.code !== 'PGRST116') { // PGRST116 means no rows returned
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
          token: crypto.randomUUID()
        })
        .eq('id', existingInvitation.id);

      if (updateError) {
        console.error('Error updating invitation:', updateError);
        throw new Error(`Error updating invitation: ${updateError.message}`);
      }
    } else {
      // Create new invitation record
      console.log('Creating new invitation record');
      const { error: createError } = await supabaseAdmin
        .from('invitations')
        .insert({
          email,
          role,
          invited_by: invitingUser.id,
          status: 'pending',
          token: crypto.randomUUID()
        });

      if (createError) {
        console.error('Error creating invitation:', createError);
        throw new Error(`Error creating invitation record: ${createError.message}`);
      }
    }

    // Send invitation email using Resend
    console.log('Sending invitation email');
    const origin = req.headers.get('origin') || '';
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY is not set');
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Expense Tracker <onboarding@resend.dev>',
        to: [email],
        subject: 'Invitation to Expense Tracker',
        html: `
          <h1>Welcome to Expense Tracker!</h1>
          <p>You've been invited to join Expense Tracker as a ${role}.</p>
          <p>Click the link below to accept the invitation:</p>
          <p><a href="${origin}/auth">Accept Invitation</a></p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error('Error sending invitation email:', emailError);
      throw new Error('Failed to send invitation email');
    }

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