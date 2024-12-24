import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export const getSupabaseAdmin = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

export async function handleInvitation(
  supabaseAdmin: any,
  email: string,
  role: string,
  invitingUserId: string,
  sourceId: string,
  token: string
) {
  // Check for existing pending invitation
  const { data: existingInvitation, error: invitationError } = await supabaseAdmin
    .from('invitations')
    .select('*')
    .eq('email', email)
    .eq('status', 'pending')
    .single();

  if (invitationError && invitationError.code !== 'PGRST116') {
    console.error('Error checking existing invitation:', invitationError);
    throw new Error(`Error checking existing invitation: ${invitationError.message}`);
  }

  if (existingInvitation) {
    console.log('Found existing pending invitation, updating it');
    const { error: updateError } = await supabaseAdmin
      .from('invitations')
      .update({
        role,
        invited_by: invitingUserId,
        updated_at: new Date().toISOString(),
        token,
        source_id: sourceId
      })
      .eq('id', existingInvitation.id);

    if (updateError) {
      console.error('Error updating invitation:', updateError);
      throw new Error(`Error updating invitation: ${updateError.message}`);
    }
  } else {
    console.log('Creating new invitation record');
    const { error: createError } = await supabaseAdmin
      .from('invitations')
      .insert({
        email,
        role,
        invited_by: invitingUserId,
        status: 'pending',
        token,
        source_id: sourceId
      });

    if (createError) {
      console.error('Error creating invitation:', createError);
      throw new Error(`Error creating invitation record: ${createError.message}`);
    }
  }
}