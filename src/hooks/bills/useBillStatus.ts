import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useBillStatus = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleUpdateBillStatus = useCallback(async (billId: string, status: 'active' | 'on-hold' | 'completed') => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('bills')
        .update({ status })
        .eq('id', billId);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error updating bill status:', error);
      toast({
        title: "Error",
        description: "Failed to update bill status",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [toast]);

  return {
    isSubmitting,
    setIsSubmitting,
    handleUpdateBillStatus
  };
};