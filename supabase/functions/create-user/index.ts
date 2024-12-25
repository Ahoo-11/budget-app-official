import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, role, sourceId } = await req.json()
    console.log('Creating user with:', { email, role, sourceId })

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

    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Check if user already exists
    const { data: existingUser, error: userCheckError } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser?.users.find(u => u.email === email)

    let userId: string

    if (userExists) {
      console.log('User already exists:', email)
      userId = userExists.id
    } else {
      // Create new user
      const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
      })

      if (createError) {
        console.error('Error creating user:', createError)
        throw createError
      }

      userId = userData.user.id
      console.log('Created new user with ID:', userId)
    }

    // Check if user role already exists
    const { data: existingRole } = await supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!existingRole) {
      // Create user role only if it doesn't exist
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({ user_id: userId, role })

      if (roleError) {
        console.error('Error creating user role:', roleError)
        throw roleError
      }
      console.log('Created user role:', role)
    } else {
      // Update existing role if different
      if (existingRole.role !== role) {
        const { error: updateRoleError } = await supabaseAdmin
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId)

        if (updateRoleError) {
          console.error('Error updating user role:', updateRoleError)
          throw updateRoleError
        }
        console.log('Updated user role to:', role)
      }
    }

    // Check if source permission already exists
    const { data: existingPermission } = await supabaseAdmin
      .from('source_permissions')
      .select('*')
      .eq('user_id', userId)
      .eq('source_id', sourceId)
      .single()

    if (!existingPermission) {
      // Create source permission with appropriate permissions based on role
      const { error: permError } = await supabaseAdmin
        .from('source_permissions')
        .insert({
          user_id: userId,
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
      console.log('Created source permission for source:', sourceId)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user: { id: userId, email }
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