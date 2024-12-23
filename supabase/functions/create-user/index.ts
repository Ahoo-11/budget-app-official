import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts'
import { CreateUserPayload } from '../_shared/types.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, role, sourceId } = await req.json() as CreateUserPayload
    console.log('Received request:', { email, role, sourceId })

    if (!email || !role || !sourceId) {
      throw new Error('Missing required fields')
    }

    // Get the current user making the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseAdmin = getSupabaseAdmin()
    
    // Get the inviting user
    const { data: { user: invitingUser }, error: userError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !invitingUser) {
      console.error('Error getting inviting user:', userError)
      throw new Error('Error getting inviting user')
    }

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .insert({
        email,
        role,
        invited_by: invitingUser.id,
        status: 'pending'
      })
      .select()
      .single()

    if (invitationError) {
      console.error('Error creating invitation:', invitationError)
      throw new Error('Error creating invitation record')
    }

    // Create source permission
    const { error: permissionError } = await supabaseAdmin
      .from('source_permissions')
      .insert({
        user_id: invitation.id, // Use the invitation ID as a temporary user ID
        source_id: sourceId,
        can_view: true,
        can_create: role !== 'viewer',
        can_edit: role !== 'viewer',
        can_delete: role === 'super_admin'
      })

    if (permissionError) {
      console.error('Error creating source permission:', permissionError)
      throw new Error('Error creating source permission')
    }

    // Generate invitation URL
    const origin = req.headers.get('origin') || ''
    const invitationUrl = `${origin}/accept-invitation?token=${invitation.token}`

    // For now, just log the URL (we'll implement email sending later)
    console.log('Invitation URL:', invitationUrl)

    return new Response(
      JSON.stringify({
        message: 'User invited successfully',
        invitationUrl
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