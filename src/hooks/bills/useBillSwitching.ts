import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { BillProduct } from "@/types/bill";
import { deserializeBillItems } from "@/components/pos/BillManager";
import { useQueryClient } from '@tanstack/react-query';

export const useBillSwitching = (
  sourceId: string,
  setSelectedProducts: (products: BillProduct[]) => void,
  handleUpdateBillStatus: (billId: string, status: 'active' | 'completed') => Promise<boolean>
) => {
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const { toast } = useToast();
  const session = useSession();
  const queryClient = useQueryClient();

  // Initialize active bill on mount
  useEffect(() => {
    const initializeActiveBill = async () => {
      try {
        const { data, error } = await supabase
          .from('bills')
          .select('*')
          .eq('source_id', sourceId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error fetching active bill:', error);
          return;
        }

        if (data) {
          console.log('Found existing active bill:', data.id);
          setActiveBillId(data.id);
          const billItems = deserializeBillItems(data.items);
          setSelectedProducts(billItems);
        }
      } catch (error) {
        console.error('Error initializing active bill:', error);
      }
    };

    initializeActiveBill();
  }, [sourceId, setSelectedProducts]);

  const handleNewBill = useCallback(async () => {
    console.log('🆕 Creating new bill...');
    
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a bill.",
        variant: "destructive",
      });
      return null;
    }

    try {
      // If there's an active bill with items, save it first
      if (activeBillId) {
        const { data: currentBill } = await supabase
          .from('bills')
          .select('items')
          .eq('id', activeBillId)
          .single();

        if (currentBill && currentBill.items && currentBill.items.length > 0) {
          console.log('📝 Saving current active bill:', activeBillId);
          // Keep it as active, don't complete it
          await supabase
            .from('bills')
            .update({ status: 'active' })
            .eq('id', activeBillId);
        }
      }

      // Create new bill
      const { data: newBill, error } = await supabase
        .from('bills')
        .insert([
          {
            source_id: sourceId,
            status: 'active', // Always create as active
            items: [],
            user_id: session.user.id,
            subtotal: 0,
            total: 0,
            gst: 0,
            discount: 0,
            date: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      console.log('✨ Created new bill:', newBill);
      
      // Clear the interface
      setSelectedProducts([]);
      
      // Set the new bill as active
      setActiveBillId(newBill.id);

      // Force an immediate refetch of bills
      await queryClient.invalidateQueries({ queryKey: ['bills', sourceId] });
      console.log('🔄 Invalidated bills query');

      toast({
        title: "Success",
        description: "New bill created successfully",
      });

      return newBill.id;
    } catch (error) {
      console.error('❌ Error creating new bill:', error);
      toast({
        title: "Error",
        description: "Failed to create new bill. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  }, [session?.user?.id, sourceId, toast, setSelectedProducts, queryClient, activeBillId]);

  const handleSwitchBill = useCallback(async (billId: string) => {
    console.log('🔄 Switching to bill:', billId);
    
    try {
      const { data: bill, error } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .single();

      if (error) throw error;

      console.log('📋 Retrieved bill data:', bill);

      // Set the selected bill as active
      setActiveBillId(billId);

      // Set the products from the bill
      if (bill.items) {
        const billItems = deserializeBillItems(bill.items);
        console.log('📦 Setting bill items:', billItems);
        setSelectedProducts(billItems);
      } else {
        console.log('⚠️ No items in bill, clearing selection');
        setSelectedProducts([]);
      }

      toast({
        title: "Success",
        description: "Switched to selected bill",
      });

      return true;
    } catch (error) {
      console.error('❌ Error switching bill:', error);
      toast({
        title: "Error",
        description: "Failed to switch bill. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [setActiveBillId, setSelectedProducts, toast]);

  return {
    activeBillId,
    handleNewBill,
    handleSwitchBill
  };
};
