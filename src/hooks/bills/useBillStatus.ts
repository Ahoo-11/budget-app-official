import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BillStatus } from "@/types/bills";

export function useBillStatus() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleUpdateBillStatus = async (billId: string, status: BillStatus): Promise<void> => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('budgetapp_bills')
        .update({ status })
        .eq('id', billId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Bill ${status === 'paid' ? 'paid' : 'activated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating bill status:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleUpdateBillStatus,
  };
}