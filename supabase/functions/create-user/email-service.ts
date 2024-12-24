import { getSupabaseAdmin } from '../_shared/supabase-admin.ts'

export const sendInvitationEmail = async (email: string, role: string, origin: string) => {
  console.log('Sending invitation email to:', email)
  
  const supabase = getSupabaseAdmin()
  
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        to: [email],
        subject: 'Invitation to Expense Tracker',
        html: `
          <h1>Welcome to Expense Tracker!</h1>
          <p>You've been invited to join Expense Tracker as a ${role}.</p>
          <p>Click the link below to accept the invitation:</p>
          <p><a href="${origin}/auth">Accept Invitation</a></p>
        `,
      },
    })

    if (error) {
      console.error('Error sending invitation email:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Error in sendInvitationEmail:', error)
    throw error
  }
}