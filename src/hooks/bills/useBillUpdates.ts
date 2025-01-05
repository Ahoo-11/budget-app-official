import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bill, BillProduct, serializeBillItems } from "@/types/bills";

export function useBillUpdates() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleUpdateBill = async (bill: Bill): Promise<void> => {
    try {
      setIsSubmitting(true);

      const serializedBill = {
        ...bill,
        items: serializeBillItems(bill.items)
      };

      const { error } = await supabase
        .from('bills')
        .update(serializedBill)
        .eq('id', bill.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bill updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating bill:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBill = async (billId: string): Promise<void> => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', billId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Bill deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting bill:', error);
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
    handleUpdateBill,
    handleDeleteBill,
  };
}