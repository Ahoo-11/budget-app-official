import { corsHeaders } from './utils';

export async function sendInvitationEmail(email: string, role: string, token: string, origin: string) {
  const resendApiKey = Deno.env.get('RESEND_API_KEY');
  
  if (!resendApiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }

  const emailResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Expense Tracker <onboarding@resend.dev>',
      to: [email],
      subject: 'Invitation to Expense Tracker',
      html: `
        <h1>Welcome to Expense Tracker!</h1>
        <p>You've been invited to join Expense Tracker as a ${role}.</p>
        <p>Click the link below to accept the invitation:</p>
        <p><a href="${origin}/auth?invitation=${token}">Accept Invitation</a></p>
      `,
    }),
  });

  if (!emailResponse.ok) {
    const emailError = await emailResponse.text();
    console.error('Error sending invitation email:', emailError);
    throw new Error('Failed to send invitation email');
  }

  return emailResponse;
}