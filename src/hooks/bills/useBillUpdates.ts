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

interface BillUpdate {
  items?: ReturnType<typeof serializeBillItems>;
  subtotal?: number;
  gst?: number;
  total?: number;
  discount?: number;
  payer_id?: string;
  date?: string;
  updated_at?: string;
}

interface UseBillUpdatesReturn {
  discount: number;
  date: Date;
  selectedPayerId: string;
  subtotal: number;
  gstAmount: number;
  finalTotal: number;
  handlePayerSelect: (payerId: string) => Promise<void>;
  handleDateChange: (newDate: Date) => Promise<void>;
  handleDiscountChange: (newDiscount: number) => Promise<void>;
}

export const useBillUpdates = (activeBillId: string | undefined, items: BillProduct[] = []): UseBillUpdatesReturn => {
  const [discount, setDiscount] = useState<number>(0);
  const [date, setDate] = useState<Date>(new Date());
  const [selectedPayerId, setSelectedPayerId] = useState<string>("");
  const { toast } = useToast();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstRate = 0.08; // 8% GST
  const discountedTotal = subtotal - discount; // First apply discount
  const gstAmount = (discountedTotal * gstRate); // Calculate 8% of the discounted total
  const finalTotal = discountedTotal + gstAmount; // Add GST to get final total

  const updateBillInSupabase = async (updates: BillUpdate) => {
    if (!activeBillId) {
      console.warn('No active bill ID provided for update');
      return;
    }

    try {
      console.log('Updating bill:', { activeBillId, updates });
      
      const { error } = await supabase
        .from('bills')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeBillId);

      if (error) {
        console.error('Error updating bill:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating bill:', error);
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
    const discountedTotal = subtotal - newDiscount;
    const newGstAmount = discountedTotal * gstRate;
    const newTotal = discountedTotal + newGstAmount;
    
    await updateBillInSupabase({
      discount: newDiscount,
      total: newTotal,
      items: serializeBillItems(items),
      subtotal,
      gst: newGstAmount,
      date: date.toISOString(),
      payer_id: selectedPayerId
    });
  };

  useEffect(() => {
    if (!activeBillId || items.length === 0) return;
    
    const updateBill = async () => {
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
  }, [items, subtotal, gstAmount, finalTotal, activeBillId, discount, selectedPayerId, date]);

  useEffect(() => {
    const loadBillData = async () => {
      if (!activeBillId) return;

      try {
        const { data: bill, error } = await supabase
          .from('bills')
          .select('*')
          .eq('id', activeBillId)
          .maybeSingle();

        if (error) throw error;

        if (bill) {
          setDiscount(bill.discount || 0);
          setDate(new Date(bill.date));
          setSelectedPayerId(bill.payer_id || "");
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
  }, [activeBillId, toast]);

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
