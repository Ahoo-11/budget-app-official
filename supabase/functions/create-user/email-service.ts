const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

export const sendInvitationEmail = async (email: string, role: string, origin: string) => {
  if (!RESEND_API_KEY) {
    throw new Error('Missing RESEND_API_KEY environment variable')
  }

  console.log('Sending invitation email to:', email)
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'Expense Tracker <noreply@budget-app-official.lovable.app>',
      to: [email],
      subject: 'Invitation to Expense Tracker',
      html: `
        <h1>Welcome to Expense Tracker!</h1>
        <p>You've been invited to join Expense Tracker as a ${role}.</p>
        <p>Click the link below to accept the invitation:</p>
        <p><a href="${origin}/auth">Accept Invitation</a></p>
      `,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Error sending invitation email:', error)
    throw new Error(`Failed to send invitation email: ${error}`)
  }

  return await response.json()
}