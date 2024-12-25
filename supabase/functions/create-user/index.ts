import { corsHeaders } from '../_shared/cors.ts'
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts'
import { CreateUserPayload } from '../_shared/types.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, role, sourceId } = await req.json()

    // Validate required fields
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

    // Create user with Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { role }
    })

    if (userError) {
      console.error('Error creating user:', userError)
      throw userError
    }

    // Create user role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ user_id: userData.user.id, role })

    if (roleError) {
      console.error('Error creating user role:', roleError)
      throw roleError
    }

    // Create source permission
    const { error: permError } = await supabaseAdmin
      .from('source_permissions')
      .insert({
        user_id: userData.user.id,
        source_id: sourceId,
        can_view: true,
        can_create: role !== 'viewer',
        can_edit: role !== 'viewer',
        can_delete: role === 'admin' || role === 'super_admin'
      })

    if (permError) {
      console.error('Error creating source permission:', permError)
      throw permError
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user: userData.user
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
        error: 'Error creating user',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})