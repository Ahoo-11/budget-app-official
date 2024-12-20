import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, role } = await req.json()

    // Verify the invitation exists and is pending
    const { data: invitation, error: invitationError } = await supabaseClient
      .from('invitations')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (invitationError || !invitation) {
      return new Response(
        JSON.stringify({ error: 'Invitation not found or not pending' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseClient.auth.admin.listUsers();
    const userExists = existingUser.users.some(user => user.email === email);

    if (userExists) {
      // Update invitation status to accepted since user exists
      const { error: updateError } = await supabaseClient
        .from('invitations')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', invitation.id)

      if (updateError) {
        throw updateError
      }

      return new Response(
        JSON.stringify({ message: 'User already exists, invitation marked as accepted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // If user doesn't exist, proceed with sending invitation
    const { error: inviteError } = await supabaseClient.auth.admin.inviteUserByEmail(email, {
      data: { role }
    })

    if (inviteError) {
      throw inviteError
    }

    // Update the invitation record with a new expiry
    const { error: updateError } = await supabaseClient
      .from('invitations')
      .update({ 
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ message: 'Invitation resent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Resend invitation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})