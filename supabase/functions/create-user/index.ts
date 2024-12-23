import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabase-client.ts'

interface CreateUserRequest {
  email: string
  role: 'super_admin' | 'admin' | 'viewer'
  sourceId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      throw new Error('No authorization header')
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Get the inviting user's information and validate their role
    const { data: { user: invitingUser }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !invitingUser) {
      console.error('Error getting inviting user:', userError)
      throw new Error('Error getting inviting user')
    }

    // Verify the inviting user is a super_admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', invitingUser.id)
      .single()

    if (roleError || !roleData) {
      console.error('Error getting user role:', roleError)
      throw new Error('Error verifying user role')
    }

    if (roleData.role !== 'super_admin') {
      console.error('User is not a super admin:', invitingUser.id)
      throw new Error('Only super admins can create users')
    }

    // Get request body
    const { email, role, sourceId }: CreateUserRequest = await req.json()

    if (!email || !role || !sourceId) {
      console.error('Missing required fields:', { email, role, sourceId })
      throw new Error('Missing required fields')
    }

    console.log('Creating invitation for:', { email, role, sourceId })

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .insert({
        email,
        role,
        invited_by: invitingUser.id,
        status: 'pending',
        token: crypto.randomUUID()
      })
      .select()
      .single()

    if (invitationError) {
      console.error('Error creating invitation:', invitationError)
      throw new Error('Error creating invitation record')
    }

    if (!invitation) {
      console.error('No invitation data returned')
      throw new Error('No invitation data returned')
    }

    // Generate invitation URL
    const invitationUrl = `${new URL(req.url).origin}/accept-invitation?token=${invitation.token}`

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set')
      throw new Error('Email service configuration error')
    }

    // Send invitation email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Expense Tracker <noreply@logicframeworks.com>',
        to: email,
        subject: 'Invitation to join',
        html: `
          <p>You have been invited to join with ${role} role.</p>
          <p>Click the link below to accept the invitation:</p>
          <p><a href="${invitationUrl}">${invitationUrl}</a></p>
        `
      })
    })

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Error sending email:', errorText)
      throw new Error('Error sending invitation email')
    }

    return new Response(
      JSON.stringify({ 
        message: 'Invitation sent successfully',
        invitationUrl 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error processing invitation:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Error processing invitation', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})