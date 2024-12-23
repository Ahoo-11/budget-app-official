import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const resendApiKey = Deno.env.get('RESEND_API_KEY')

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
      throw new Error('No authorization header')
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl!, supabaseServiceKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Get the inviting user's information
    const { data: { user: invitingUser }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !invitingUser) {
      console.error('Error getting inviting user:', userError)
      throw new Error('Error getting inviting user')
    }

    // Get request body
    const { email, role, sourceId }: CreateUserRequest = await req.json()

    if (!email || !role || !sourceId) {
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

    // Generate invitation URL
    const invitationUrl = `${new URL(req.url).origin}/accept-invitation?token=${invitation.token}`

    // Send invitation email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
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
      console.error('Error sending email:', await emailResponse.text())
      throw new Error('Error sending invitation email')
    }

    return new Response(
      JSON.stringify({ message: 'Invitation sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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