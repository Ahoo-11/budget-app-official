export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function validateRequest(email: string, role: string, sourceId: string) {
  if (!email || !role || !sourceId) {
    console.error('Missing required fields:', { email, role, sourceId });
    throw new Error('Missing required fields');
  }
}