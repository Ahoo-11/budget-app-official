import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateUserPayload {
  email: string;
  role: 'super_admin' | 'admin' | 'viewer';
  sourceId: string;
  password: string;
}

console.log('Create user function initialized')

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with admin privileges
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

    const { email, role, sourceId, password }: CreateUserPayload = await req.json()
    console.log('Creating user with email:', email, 'and role:', role)

    // 1. Create user with Supabase Auth
    console.log('Step 1: Creating auth user...')
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
        }),
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
          error: 'No user data returned after creation'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log('Auth user created successfully:', userData.user.id)

    // 2. Create user role
    console.log('Step 2: Creating user role...')
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: role
      })

    if (roleError) {
      console.error('Error creating user role:', roleError)
      return new Response(
        JSON.stringify({ 
          error: 'Error creating user role',
          details: roleError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log('User role created successfully')

    // 3. Create profile
    console.log('Step 3: Creating user profile...')
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userData.user.id,
        email: email
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      return new Response(
        JSON.stringify({ 
          error: 'Error creating profile',
          details: profileError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    console.log('Profile created successfully')

    // 4. Create source permission if sourceId is provided
    if (sourceId && sourceId !== 'none') {
      console.log('Step 4: Creating source permission...')
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
        return new Response(
          JSON.stringify({ 
            error: 'Error creating source permission',
            details: permissionError.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          }
        )
      }

      console.log('Source permission created successfully')
    }

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
    console.error('Error in create-user function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})