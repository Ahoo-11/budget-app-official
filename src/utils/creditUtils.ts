import { supabase } from "@/integrations/supabase/client";

export const getBillStatus = async (
  billDate: Date,
  sourceId: string,
  payerId: string | null
): Promise<'overdue' | 'pending'> => {
  if (!payerId) return 'pending';

  try {
    // Get payer credit settings
    const { data: settings } = await supabase
      .from('source_payer_settings')
      .select('credit_days')
      .eq('source_id', sourceId)
      .eq('payer_id', payerId)
      .single();

    const creditDays = settings?.credit_days || 1; // Default to 1 day if no settings
    const dueDate = new Date(billDate);
    dueDate.setDate(dueDate.getDate() + creditDays);

    return new Date() > dueDate ? 'overdue' : 'pending';
  } catch (error) {
    console.error('Error checking bill status:', error);
    return 'pending';
  }
};