export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export function validateRequest(email: string, role: string, sourceId: string) {
  if (!email) {
    throw new Error('Email is required');
  }
  if (!role) {
    throw new Error('Role is required');
  }
  if (!sourceId) {
    throw new Error('Source ID is required');
  }
}