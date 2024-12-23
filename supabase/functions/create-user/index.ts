import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin } from './supabase-admin.ts'
import { sendInvitationEmail } from './email-service.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, role, sourceId } = await req.json()
    console.log('Received invitation request for:', { email, role, sourceId })

    if (!email || !role || !sourceId) {
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          details: 'Email, role, and sourceId are required'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get the current user making the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user: invitingUser }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !invitingUser) {
      throw new Error('Error getting inviting user')
    }

    // Create invitation record
    const { error: invitationError } = await supabaseAdmin
      .from('invitations')
      .insert({
        email,
        role,
        invited_by: invitingUser.id,
        source_id: sourceId,
      })

    if (invitationError) {
      console.error('Error creating invitation:', invitationError)
      throw new Error('Error creating invitation record')
    }

    // Send invitation email
    await sendInvitationEmail(email, role, req.headers.get('origin') || '')

    return new Response(
      JSON.stringify({
        message: 'Invitation sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({
        error: 'Error processing invitation',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})