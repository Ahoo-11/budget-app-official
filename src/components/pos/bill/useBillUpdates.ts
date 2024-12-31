import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { BillProduct } from "@/types/bill";

export const useBillUpdates = (activeBillId: string | undefined, items: BillProduct[]) => {
  const [discount, setDiscount] = useState<number>(0);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const { toast } = useToast();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstRate = 0.08; // 8% GST
  const gstAmount = subtotal * gstRate;
  const finalTotal = subtotal + gstAmount - discount;

  const updateBillInSupabase = async (updates: any) => {
    if (!activeBillId) return;

    try {
      const { error } = await supabase
        .from('bills')
        .update(updates)
        .eq('id', activeBillId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating bill:', error);
      toast({
        title: "Error",
        description: "Failed to update bill",
        variant: "destructive",
      });
    }
  };

  const handleCustomerSelect = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    await updateBillInSupabase({ customer_id: customerId });
  };

  const handleDateChange = async (newDate: Date) => {
    setDate(newDate);
    await updateBillInSupabase({ date: newDate.toISOString() });
  };

  const handleDiscountChange = async (newDiscount: number) => {
    setDiscount(newDiscount);
    await updateBillInSupabase({
      discount: newDiscount,
      total: subtotal + gstAmount - newDiscount
    });
  };

  useEffect(() => {
    if (!activeBillId) return;
    
    updateBillInSupabase({
      items: items,
      subtotal: subtotal,
      gst: gstAmount,
      total: finalTotal
    });
  }, [items, subtotal, gstAmount, finalTotal, activeBillId]);

  return {
    discount,
    date,
    selectedCustomerId,
    subtotal,
    gstAmount,
    finalTotal,
    handleCustomerSelect,
    handleDateChange,
    handleDiscountChange
  };
};