import { corsHeaders } from '../_shared/cors.ts'
import { CreateUserPayload, ErrorResponse } from '../_shared/types.ts'
import { 
  createAuthUser, 
  createUserRole, 
  createUserProfile, 
  createSourcePermission 
} from './user-creation.ts'

console.log('Create user function initialized')

Deno.serve(async (req) => {
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

    try {
      // Step 1: Create auth user
      const user = await createAuthUser(email, password)
      console.log('Auth user created successfully:', user.id)

      try {
        // Step 2: Create user role
        await createUserRole(user.id, role)
        console.log('User role created successfully')

        try {
          // Step 3: Create profile
          await createUserProfile(user.id, email)
          console.log('Profile created successfully')

          // Step 4: Create source permission if sourceId is provided
          if (sourceId && sourceId !== 'none') {
            try {
              await createSourcePermission(user.id, sourceId, role)
              console.log('Source permission created successfully')
            } catch (error) {
              console.error('Error in source permission creation:', error)
              throw error
            }
          }

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
          console.error('Error in profile creation:', error)
          throw error
        }
      } catch (error) {
        console.error('Error in role creation:', error)
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