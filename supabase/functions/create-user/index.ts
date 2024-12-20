import { corsHeaders } from '../_shared/cors.ts'
import { CreateUserPayload, ErrorResponse } from '../_shared/types.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log('Received payload:', JSON.stringify(payload, null, 2))
    
    // Validate payload
    if (!payload.email || !payload.role || !payload.password || !payload.sourceId) {
      console.error('Missing required fields')
      return new Response(
        JSON.stringify({
          error: 'Missing required fields',
          details: 'Email, role, password, and sourceId are required'
        } as ErrorResponse),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    const { email, role, sourceId, password } = payload as CreateUserPayload
    console.log('Creating user with role:', role)

    // Initialize Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    try {
      // Step 1: Create auth user
      console.log('Creating auth user...')
      const { data: { user }, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (createUserError) {
        console.error('Error creating auth user:', createUserError)
        throw new Error(`Error creating auth user: ${createUserError.message}`)
      }

      if (!user) {
        console.error('No user data returned')
        throw new Error('No user data returned after creation')
      }

      console.log('Auth user created successfully:', user.id)

      try {
        // Step 2: Create user role
        console.log('Creating user role...')
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: role
          })

        if (roleError) {
          console.error('Error creating user role:', roleError)
          // Clean up: Delete the auth user since role creation failed
          await supabaseAdmin.auth.admin.deleteUser(user.id)
          throw new Error(`Error creating user role: ${roleError.message}`)
        }

        console.log('User role created successfully')

        try {
          // Step 3: Create profile
          console.log('Creating user profile...')
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: user.id,
              email: email
            })

          if (profileError) {
            console.error('Error creating profile:', profileError)
            // Clean up: Delete the auth user since profile creation failed
            await supabaseAdmin.auth.admin.deleteUser(user.id)
            throw new Error(`Error creating profile: ${profileError.message}`)
          }

          console.log('Profile created successfully')

          // Step 4: Create source permission if sourceId is provided
          if (sourceId && sourceId !== 'none') {
            console.log('Creating source permission...')
            const { error: permissionError } = await supabaseAdmin
              .from('source_permissions')
              .insert({
                user_id: user.id,
                source_id: sourceId,
                can_view: true,
                can_create: role !== 'viewer',
                can_edit: role !== 'viewer',
                can_delete: role === 'admin' || role === 'super_admin'
              })

            if (permissionError) {
              console.error('Error creating source permission:', permissionError)
              // Clean up: Delete the auth user since permission creation failed
              await supabaseAdmin.auth.admin.deleteUser(user.id)
              throw new Error(`Error creating source permission: ${permissionError.message}`)
            }
            console.log('Source permission created successfully')
          }

          console.log('User creation completed successfully')
          return new Response(
            JSON.stringify({
              user,
              message: 'User created successfully'
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200,
            }
          )
        } catch (error) {
          console.error('Error in profile creation step:', error)
          throw error
        }
      } catch (error) {
        console.error('Error in role creation step:', error)
        throw error
      }
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