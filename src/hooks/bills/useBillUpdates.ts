import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bill } from "@/types/bills";

export function useBillUpdates() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedPayerId, setSelectedPayerId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUpdateBill = async (bill: Bill): Promise<void> => {
    try {
      setIsSubmitting(true);

      const { error } = await supabase
        .from('bills')
        .update({
          ...bill,
          items: JSON.stringify(bill.items)
        })
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

  const handlePayerSelect = (payerId: string | null) => {
    setSelectedPayerId(payerId);
  };

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };

  return {
    isSubmitting,
    handleUpdateBill,
    handleDeleteBill,
    date,
    selectedPayerId,
    handlePayerSelect,
    handleDateChange,
  };
}