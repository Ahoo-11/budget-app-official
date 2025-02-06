import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/client";
import { Bill, BillDBRow, deserializeBillItems, serializeBillItems } from "@/types/bills";
import { useState } from "react";

type BillWithPayer = Tables['bills']['Row'] & {
  payers: Pick<Tables['payers']['Row'], 'name'> | null;
};

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
      
      const dbRow = data as BillWithPayer;
      
      return {
        ...dbRow,
        items: deserializeBillItems(dbRow.items),
        status: dbRow.status as Bill['status'],
        payer_name: dbRow.payers?.name
      };
    },
    enabled: !!billId,
  });

  const updateBill = async (updatedBill: Partial<Tables['bills']['Update']>) => {
    const { error } = await supabase
      .from('bills')
      .update({
        ...updatedBill,
        items: updatedBill.items ? serializeBillItems(updatedBill.items) : undefined
      } as Tables['bills']['Update'])
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