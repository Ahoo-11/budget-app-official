import { useState, useCallback, useEffect } from "react";
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

  useEffect(() => {
    const initializeActiveBill = async () => {
      try {
        const { data, error } = await supabase
          .from('bills')
          .select('id')
          .eq('source_id', sourceId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // Not found error
            console.error('Error fetching active bill:', error);
          }
          return;
        }

        if (data) {
          console.log('Found existing active bill:', data.id);
          setActiveBillId(data.id);
          // Fetch bill items
          const { data: billData } = await supabase
            .from('bills')
            .select('*')
            .eq('id', data.id)
            .single();
            
          if (billData) {
            const billItems = deserializeBillItems(billData.items);
            setSelectedProducts(billItems);
          }
        }
      } catch (error) {
        console.error('Error initializing active bill:', error);
      }
    };

    if (!activeBillId) {
      initializeActiveBill();
    }
  }, [sourceId, setSelectedProducts, activeBillId]);

  const handleNewBill = useCallback(async () => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a bill",
        variant: "destructive",
      });
      return null;
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
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log('New bill created:', newBill);
      setActiveBillId(newBill.id);
      setSelectedProducts([]);
      return newBill.id;
    } catch (error) {
      console.error('Error creating bill:', error);
      toast({
        title: "Error",
        description: "Failed to create new bill",
        variant: "destructive",
      });
      return null;
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
      
      const billItems = deserializeBillItems(data.items);
      console.log('Deserialized bill items:', billItems);
      
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