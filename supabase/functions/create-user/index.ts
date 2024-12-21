import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface CreateUserPayload {
  email: string;
  role: 'super_admin' | 'admin' | 'viewer';
  sourceId: string;
  password: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
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

    // Create user with Supabase Auth
    const { data: userData, error: userError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (userError) throw userError

    // Create user role
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: userData.user.id,
        role: role
      })

    if (roleError) throw roleError

    // Create source permission
    const { error: permissionError } = await supabaseClient
      .from('source_permissions')
      .insert({
        user_id: userData.user.id,
        source_id: sourceId,
        can_view: true,
        can_create: role !== 'viewer',
        can_edit: role !== 'viewer',
        can_delete: role === 'admin' || role === 'super_admin'
      })

    if (permissionError) throw permissionError

    return new Response(JSON.stringify({ user: userData.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})