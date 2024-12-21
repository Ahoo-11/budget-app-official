import { corsHeaders } from '../_shared/cors.ts'
import { CreateUserPayload, ErrorResponse } from '../_shared/types.ts'
import { getSupabaseAdmin } from '../_shared/supabase-admin.ts'

console.log('Create user function initialized')

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log('Received payload:', JSON.stringify(payload, null, 2))
    
    if (!payload.email || !payload.role || !payload.password) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          details: 'Email, role, and password are required'
        } as ErrorResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const { email, role, sourceId, password }: CreateUserPayload = payload
    const supabaseAdmin = getSupabaseAdmin()

    try {
      // Step 1: Create auth user
      console.log('Creating auth user for email:', email)
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (userError) {
        console.error('Error creating auth user:', userError)
        return new Response(
          JSON.stringify({
            error: 'Error creating auth user',
            details: userError.message
          } as ErrorResponse),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }

      if (!userData.user) {
        console.error('No user data returned')
        return new Response(
          JSON.stringify({
            error: 'User creation failed',
            details: 'No user data returned'
          } as ErrorResponse),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }

      // Step 2: Create user role
      console.log('Creating user role:', role, 'for user:', userData.user.id)
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: role
        })

      if (roleError) {
        console.error('Error creating user role:', roleError)
        // Clean up: Delete the auth user since role creation failed
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
        return new Response(
          JSON.stringify({
            error: 'Error creating user role',
            details: roleError.message
          } as ErrorResponse),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }

      // Step 3: Create profile
      console.log('Creating profile for user:', userData.user.id)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userData.user.id,
          email: email
        })

      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Clean up: Delete the auth user since profile creation failed
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
        return new Response(
          JSON.stringify({
            error: 'Error creating profile',
            details: profileError.message
          } as ErrorResponse),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
          }
        )
      }

      // Step 4: Create source permission if sourceId is provided
      if (sourceId && sourceId !== 'none') {
        console.log('Creating source permission for user:', userData.user.id, 'source:', sourceId)
        const { error: permissionError } = await supabaseAdmin
          .from('source_permissions')
          .insert({
            user_id: userData.user.id,
            source_id: sourceId,
            can_view: true,
            can_create: role !== 'viewer',
            can_edit: role !== 'viewer',
            can_delete: role === 'admin' || role === 'super_admin'
          })

        if (permissionError) {
          console.error('Error creating source permission:', permissionError)
          // Clean up: Delete the auth user since permission creation failed
          await supabaseAdmin.auth.admin.deleteUser(userData.user.id)
          return new Response(
            JSON.stringify({
              error: 'Error creating source permission',
              details: permissionError.message
            } as ErrorResponse),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500,
            }
          )
        }
      }

      console.log('User creation completed successfully')
      return new Response(
        JSON.stringify({
          user: userData.user,
          message: 'User created successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } catch (error) {
      console.error('Error in user creation process:', error)
      return new Response(
        JSON.stringify({
          error: 'Error creating user',
          details: error.message,
          code: 500
        } as ErrorResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }
  } catch (error) {
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
        details: error.stack,
        code: 500
      } as ErrorResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})