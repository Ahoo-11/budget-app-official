import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/components/ui/use-toast";
import { BillProduct, BillItemJson } from "@/types/bill";

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
      // Create a new active bill
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
      // Fetch the bill data
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .single();

      if (error) throw error;

      const billItems = Array.isArray(data.items) 
        ? (data.items as unknown[] as BillItemJson[]).map(item => ({
            id: item.id,
            name: item.name,
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 0,
            type: item.type,
            source_id: item.source_id,
            category: item.category,
            image_url: item.image_url,
            description: item.description,
          }))
        : [];

      setActiveBillId(billId);
      setSelectedProducts(billItems);
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