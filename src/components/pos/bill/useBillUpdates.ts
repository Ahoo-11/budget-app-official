import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bill, BillDBRow, deserializeBillItems, serializeBillItems } from "@/types/bills";
import { useState } from "react";

export const useBillUpdates = (billId: string) => {
  const [date, setDate] = useState<Date>(new Date());
  const [selectedPayerId, setSelectedPayerId] = useState<string | null>(null);

  const { data: bill, error, isLoading } = useQuery<Bill | null>({
    queryKey: ['bill', billId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bills')
        .select('*, payers(name)')
        .eq('id', billId)
        .single();

      if (error) throw error;
      
      const dbRow = data as BillDBRow & { payers: { name: string } | null };
      
      return {
        ...dbRow,
        items: deserializeBillItems(dbRow.items),
        payer_name: dbRow.payers?.name
      };
    },
    enabled: !!billId,
  });

  const updateBill = async (updatedBill: Partial<Bill>) => {
    const { error } = await supabase
      .from('bills')
      .update({
        ...updatedBill,
        items: updatedBill.items ? serializeBillItems(updatedBill.items) : undefined
      })
      .eq('id', billId);

    if (error) throw error;
  };

  const handlePayerSelect = (payerId: string | null) => {
    setSelectedPayerId(payerId);
  };

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };

  return {
    bill,
    error,
    isLoading,
    updateBill,
    date,
    selectedPayerId,
    handlePayerSelect,
    handleDateChange,
  };
};