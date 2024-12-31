import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { BillProduct } from "@/types/bill";
import { deserializeBillItems } from "@/components/pos/BillManager";

export const useBillSwitching = (
  sourceId: string,
  setSelectedProducts: (products: BillProduct[]) => void,
  handleUpdateBillStatus: (billId: string, status: 'active' | 'completed') => Promise<boolean>
) => {
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const { toast } = useToast();
  const session = useSession();

  const handleNewBill = useCallback(async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a bill",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Creating new bill...');
      const { data: newBill, error } = await supabase
        .from('bills')
        .insert({
          source_id: sourceId,
          user_id: session.user.id,
          status: 'active',
          items: [],
          subtotal: 0,
          total: 0,
          gst: 0,
          discount: 0,
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('New bill created:', newBill);
      setActiveBillId(newBill.id);
      setSelectedProducts([]);
    } catch (error) {
      console.error('Error creating bill:', error);
      toast({
        title: "Error",
        description: "Failed to create new bill",
        variant: "destructive",
      });
    }
  }, [session?.user?.id, sourceId, setSelectedProducts, toast]);

  const handleSwitchBill = useCallback(async (billId: string) => {
    try {
      console.log('Switching to bill:', billId);
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .single();

      if (error) throw error;
      
      console.log('Fetched bill data:', data);
      console.log('Bill items before deserialization:', data.items);
      
      const billItems = deserializeBillItems(data.items);
      console.log('Deserialized bill items:', billItems);
      
      setActiveBillId(billId);
      setSelectedProducts(billItems);
      console.log('State updated with bill items');
    } catch (error) {
      console.error('Error switching bill:', error);
      toast({
        title: "Error",
        description: "Failed to switch bill",
        variant: "destructive",
      });
    }
  }, [setSelectedProducts, toast]);

  return {
    activeBillId,
    handleNewBill,
    handleSwitchBill
  };
};