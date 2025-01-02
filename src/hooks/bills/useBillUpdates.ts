import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { BillProduct } from "@/types/bill";

const serializeBillItems = (items: BillProduct[]) => {
  return items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    type: item.type,
    source_id: item.source_id,
    category: item.category,
    image_url: item.image_url,
    description: item.description,
  }));
};

export const useBillUpdates = (activeBillId: string | undefined, items: BillProduct[]) => {
  const [discount, setDiscount] = useState<number>(0);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedPayerId, setSelectedPayerId] = useState<string>("");
  const { toast } = useToast();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstRate = 0.08; // 8% GST
  const gstAmount = subtotal * gstRate;
  const finalTotal = subtotal + gstAmount - discount;

  const updateBillInSupabase = async (updates: any) => {
    if (!activeBillId) {
      console.warn('No active bill ID provided for update');
      return;
    }

    try {
      console.log('Attempting to update bill:', { activeBillId, updates });
      
      const { data, error } = await supabase
        .from('bills')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeBillId)
        .select()
        .single();

      if (error) {
        console.error('Supabase error updating bill:', error);
        toast({
          title: "Error",
          description: "Failed to update bill: " + error.message,
          variant: "destructive",
        });
        return;
      }

      console.log('Bill updated successfully:', data);
    } catch (error) {
      console.error('Exception updating bill:', error);
      toast({
        title: "Error",
        description: "Failed to update bill",
        variant: "destructive",
      });
    }
  };

  const handlePayerSelect = async (payerId: string) => {
    if (!activeBillId) return;
    
    setSelectedPayerId(payerId);
    await updateBillInSupabase({ 
      payer_id: payerId,
      items: serializeBillItems(items),
      subtotal,
      gst: gstAmount,
      total: finalTotal,
      discount,
      date: date.toISOString()
    });
  };

  const handleDateChange = async (newDate: Date) => {
    if (!activeBillId) return;
    
    setDate(newDate);
    await updateBillInSupabase({ 
      date: newDate.toISOString(),
      items: serializeBillItems(items),
      subtotal,
      gst: gstAmount,
      total: finalTotal,
      discount,
      payer_id: selectedPayerId
    });
  };

  const handleDiscountChange = async (newDiscount: number) => {
    if (!activeBillId) return;
    
    setDiscount(newDiscount);
    const newTotal = subtotal + gstAmount - newDiscount;
    await updateBillInSupabase({
      discount: newDiscount,
      total: newTotal,
      items: serializeBillItems(items),
      subtotal,
      gst: gstAmount,
      date: date.toISOString(),
      payer_id: selectedPayerId
    });
  };

  useEffect(() => {
    const updateBill = async () => {
      if (!activeBillId || items.length === 0) return;
      
      console.log('Updating bill from effect:', { activeBillId, items });
      
      await updateBillInSupabase({
        items: serializeBillItems(items),
        subtotal,
        gst: gstAmount,
        total: finalTotal,
        discount,
        payer_id: selectedPayerId,
        date: date.toISOString()
      });
    };

    updateBill();
  }, [items, subtotal, gstAmount, finalTotal, activeBillId]);

  useEffect(() => {
    const loadBillData = async () => {
      if (!activeBillId) return;

      try {
        console.log('Loading bill data:', activeBillId);
        
        const { data: bill, error } = await supabase
          .from('bills')
          .select('*')
          .eq('id', activeBillId)
          .maybeSingle();

        if (error) {
          console.error('Error loading bill:', error);
          toast({
            title: "Error",
            description: "Failed to load bill data",
            variant: "destructive",
          });
          return;
        }

        if (bill) {
          console.log('Loaded bill data:', bill);
          setDiscount(bill.discount || 0);
          setDate(new Date(bill.date));
          setSelectedPayerId(bill.payer_id || "");
        }
      } catch (error) {
        console.error('Exception loading bill:', error);
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
    selectedPayerId,
    subtotal,
    gstAmount,
    finalTotal,
    handlePayerSelect,
    handleDateChange,
    handleDiscountChange
  };
};