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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
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
    console.log('Creating user with email:', email)

    // Create user with Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (userError) {
      console.error('Error creating auth user:', userError)
      throw new Error(`Error creating auth user: ${userError.message}`)
    }

    if (!userData.user) {
      console.error('No user data returned')
      throw new Error('No user data returned after creation')
    }

    console.log('User created successfully:', userData.user.id)

    // Create user role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: role
      })

    if (roleError) {
      console.error('Error creating user role:', roleError)
      throw new Error(`Error creating user role: ${roleError.message}`)
    }

    console.log('User role created successfully')

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userData.user.id,
        email: email
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      throw new Error(`Error creating profile: ${profileError.message}`)
    }

    console.log('Profile created successfully')

    // Create source permission if sourceId is provided and not 'none'
    if (sourceId && sourceId !== 'none') {
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
        throw new Error(`Error creating source permission: ${permissionError.message}`)
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