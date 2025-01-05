import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BillProduct, NewBillInput } from "@/types/bills";
import { useSession } from "@supabase/auth-helpers-react";

export function useBillSwitching(
  sourceId: string | null,
  setSelectedProducts: (products: BillProduct[]) => void,
  handleUpdateBillStatus: (billId: string, status: BillStatus) => Promise<void>
) {
  const [activeBillId, setActiveBillId] = useState<string | null>(null);
  const { toast } = useToast();
  const session = useSession();

  const initializeActiveBill = useCallback(async () => {
    try {
      if (!sourceId || sourceId === 'all' || !session?.user?.id) {
        console.log('Missing required data for bill initialization');
        return;
      }

      // Find any existing active bill for this source
      const { data: existingBills, error: fetchError } = await supabase
        .from('bills')
        .select('*')
        .eq('source_id', sourceId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingBills && existingBills.length > 0) {
        const activeBill = existingBills[0];
        setActiveBillId(activeBill.id);
        if (Array.isArray(activeBill.items)) {
          setSelectedProducts(activeBill.items as BillProduct[]);
        }
        console.log('Found existing active bill:', activeBill.id);
      } else {
        await createNewBill();
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

  const createNewBill = async () => {
    if (!sourceId || !session?.user?.id) return null;

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

    return createdBill;
  };

  const handleNewBill = useCallback(async () => {
    try {
      if (!sourceId || sourceId === 'all' || !session?.user?.id) {
        toast({
          title: "Error creating bill",
          description: "Missing required data",
          variant: "destructive",
        });
        return;
      }

      const createdBill = await createNewBill();
      
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
  }, [sourceId, setSelectedProducts, toast, session?.user?.id]);

  const handleSwitchBill = useCallback(async (billId: string) => {
    try {
      if (!session?.user?.id) {
        toast({
          title: "Error switching bill",
          description: "Authentication required",
          variant: "destructive",
        });
        return;
      }

      const { data: bill, error } = await supabase
        .from('bills')
        .select('*')
        .eq('id', billId)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      if (bill) {
        setActiveBillId(bill.id);
        if (Array.isArray(bill.items)) {
          setSelectedProducts(bill.items as BillProduct[]);
        }
        toast({
          title: "Switched bill",
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

  useEffect(() => {
    initializeActiveBill();
  }, [initializeActiveBill]);

  return {
    activeBillId,
    handleNewBill,
    handleSwitchBill,
  };
}