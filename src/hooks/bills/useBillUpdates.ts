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
      console.log('Updating bill with:', updates);
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
    await updateBillInSupabase({ 
      customer_id: customerId,
      updated_at: new Date().toISOString()
    });
  };

  const handleDateChange = async (newDate: Date) => {
    setDate(newDate);
    await updateBillInSupabase({ 
      date: newDate.toISOString(),
      updated_at: new Date().toISOString()
    });
  };

  const handleDiscountChange = async (newDiscount: number) => {
    setDiscount(newDiscount);
    await updateBillInSupabase({
      discount: newDiscount,
      total: finalTotal,
      updated_at: new Date().toISOString()
    });
  };

  // Update bill whenever items change
  useEffect(() => {
    if (!activeBillId) return;
    
    console.log('Items changed, updating bill:', items);
    updateBillInSupabase({
      items,
      subtotal,
      gst: gstAmount,
      total: finalTotal,
      updated_at: new Date().toISOString()
    });
  }, [items, subtotal, gstAmount, finalTotal, activeBillId]);

  // Load initial bill data when activeBillId changes
  useEffect(() => {
    const loadBillData = async () => {
      if (!activeBillId) return;

      try {
        const { data: bill, error } = await supabase
          .from('bills')
          .select('*')
          .eq('id', activeBillId)
          .single();

        if (error) throw error;

        if (bill) {
          setDiscount(bill.discount || 0);
          setDate(new Date(bill.date));
          setSelectedCustomerId(bill.customer_id || "");
        }
      } catch (error) {
        console.error('Error loading bill:', error);
        toast({
          title: "Error",
          description: "Failed to load bill data",
          variant: "destructive",
        });
      }
    };

    loadBillData();
  }, [activeBillId]);

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