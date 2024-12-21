import { corsHeaders } from '../_shared/cors.ts'
import { CreateUserPayload, ErrorResponse } from '../_shared/types.ts'
import { createAuthUser, createUserRole, createUserProfile, createSourcePermission } from './user-creation.ts'

console.log('Create user function initialized')

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    console.log('Received payload:', JSON.stringify(payload, null, 2))
    
    // Validate payload
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

    const { email, role, sourceId, password } = payload as CreateUserPayload

    try {
      // Step 1: Create auth user
      const user = await createAuthUser(email, password)

      try {
        // Step 2: Create user role
        await createUserRole(user.id, role)

        try {
          // Step 3: Create profile
          await createUserProfile(user.id, email)

          // Step 4: Create source permission if sourceId is provided
          if (sourceId && sourceId !== 'none') {
            try {
              await createSourcePermission(user.id, sourceId, role)
            } catch (error) {
              console.error('Error creating source permission:', error)
              // Clean up: Delete the auth user since permission creation failed
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
              await supabaseAdmin.auth.admin.deleteUser(user.id)
              throw error
            }
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
          console.error('Error creating profile:', error)
          throw error
        }
      } catch (error) {
        console.error('Error creating user role:', error)
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