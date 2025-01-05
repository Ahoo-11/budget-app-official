import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BillProduct, BillItemJson, NewBillInput } from "@/types/bills";
import { useSession } from "@supabase/auth-helpers-react";

export function useBillSwitching(
  sourceId: string | null,
  setSelectedProducts: (products: BillProduct[]) => void,
  handleUpdateBillStatus: (billId: string, status: 'completed') => Promise<void>
) {
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const { toast } = useToast();
  const session = useSession();

  const initializeActiveBill = useCallback(async () => {
    try {
      // Only proceed if we have a valid sourceId and user
      if (!sourceId || sourceId === 'all') {
        console.log('No source selected, skipping bill initialization');
        return;
      }

      if (!session?.user?.id) {
        console.log('No user session, skipping bill initialization');
        return;
      }

      // Find any existing active bill for this source
      const { data: existingBills, error: fetchError } = await supabase
        .from('bills')
        .select('*')
        .eq('source_id', sourceId)
        .eq('status', 'active')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingBills && existingBills.length > 0) {
        const activeBill = existingBills[0];
        setActiveBillId(activeBill.id);
        setSelectedProducts(Array.isArray(activeBill.items) ? activeBill.items : []);
        console.log('Found existing active bill:', activeBill.id);
      } else {
        // Create a new bill if none exists
        const newBill: NewBillInput = {
          source_id: sourceId,
          user_id: session.user.id,
          items: [],
          subtotal: 0,
          gst: 0,
          total: 0,
          status: 'active',
          paid_amount: 0,
          date: new Date().toISOString(),
        };

        const { data: createdBill, error: createError } = await supabase
          .from('bills')
          .insert([newBill])
          .select()
          .single();

        if (createError) throw createError;

        if (createdBill) {
          setActiveBillId(createdBill.id);
          setSelectedProducts([]);
          console.log('Created new active bill:', createdBill.id);
        }
      }
    } catch (error: any) {
      console.error('Error initializing active bill:', error);
      toast({
        title: "Error initializing bill",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [sourceId, setSelectedProducts, toast, session?.user?.id]);

  const handleNewBill = useCallback(async () => {
    try {
      if (!sourceId || sourceId === 'all') {
        toast({
          title: "Error creating bill",
          description: "Please select a source first",
          variant: "destructive",
        });
        return;
      }

      if (!session?.user?.id) {
        toast({
          title: "Error creating bill",
          description: "You must be logged in to create a bill",
          variant: "destructive",
        });
        return;
      }

      // Complete the current active bill if it exists
      if (activeBillId) {
        await handleUpdateBillStatus(activeBillId, 'completed');
      }

      // Create a new bill
      const newBill: NewBillInput = {
        source_id: sourceId,
        user_id: session.user.id,
        items: [],
        subtotal: 0,
        gst: 0,
        total: 0,
        status: 'active',
        paid_amount: 0,
        date: new Date().toISOString(),
      };

      const { data: createdBill, error } = await supabase
        .from('bills')
        .insert([newBill])
        .select()
        .single();

      if (error) throw error;

      if (createdBill) {
        setActiveBillId(createdBill.id);
        setSelectedProducts([]);
        toast({
          title: "New bill created",
          description: "Successfully created a new bill",
        });
      }
    } catch (error: any) {
      console.error('Error creating new bill:', error);
      toast({
        title: "Error creating bill",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [sourceId, activeBillId, handleUpdateBillStatus, setSelectedProducts, toast, session?.user?.id]);

  const handleSwitchBill = useCallback(async (billId: string) => {
    try {
      if (!session?.user?.id) {
        toast({
          title: "Error switching bill",
          description: "You must be logged in to switch bills",
          variant: "destructive",
        });
        return;
      }

      const { data: bill, error } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .eq('user_id', session.user.id)
        .single();

      if (error) throw error;

      if (bill) {
        setActiveBillId(bill.id);
        setSelectedProducts(Array.isArray(bill.items) ? bill.items : []);
        toast({
          title: "Switched to bill",
          description: `Now viewing bill #${bill.id.slice(0, 8)}`,
        });
      }
    } catch (error: any) {
      console.error('Error switching bill:', error);
      toast({
        title: "Error switching bill",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [setSelectedProducts, toast, session?.user?.id]);

  // Initialize active bill when source changes
  useEffect(() => {
    initializeActiveBill();
  }, [initializeActiveBill]);

  return {
    activeBillId,
    handleNewBill,
    handleSwitchBill,
  };
}
