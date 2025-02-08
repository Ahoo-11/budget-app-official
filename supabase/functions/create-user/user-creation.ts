import { getSupabaseAdmin } from '../_shared/supabase-client.ts'

export async function createAuthUser(email: string, password: string) {
  const supabaseAdmin = getSupabaseAdmin()
  console.log('Creating auth user for email:', email)
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    console.error('Error creating auth user:', error)
    throw new Error(error.message)
  }

  if (!data.user) {
    console.error('No user data returned')
    throw new Error('No user data returned after creation')
  }

  return data.user
}

export async function createUserRole(userId: string, role: string) {
  const supabaseAdmin = getSupabaseAdmin()
  console.log('Creating user role:', role, 'for user:', userId)
  
  const { error } = await supabaseAdmin
    .from('user_roles')
    .insert({
      user_id: userId,
      role: role
    })

  if (error) {
    console.error('Error creating user role:', error)
    throw new Error(error.message)
  }
}

export async function createUserProfile(userId: string, email: string) {
  const supabaseAdmin = getSupabaseAdmin()
  console.log('Creating profile for user:', userId)
  
  const { error: profileError } = await supabaseAdmin
    .from('budgetapp_profiles')
    .insert({
      id: userId,
      email: email
    })

  if (profileError) {
    console.error('Error creating profile:', profileError)
    throw new Error(profileError.message)
  }
}

export async function createSourcePermission(userId: string, sourceId: string, role: string) {
  const supabaseAdmin = getSupabaseAdmin()
  console.log('Creating source permission for user:', userId, 'source:', sourceId)
  
  const { error } = await supabaseAdmin
    .from('source_permissions')
    .insert({
      user_id: userId,
      source_id: sourceId,
      can_view: true,
      can_create: role !== 'viewer',
      can_edit: role !== 'viewer',
      can_delete: role === 'admin' || role === 'super_admin'
    })

  if (error) {
    console.error('Error creating source permission:', error)
    throw new Error(error.message)
  }
}