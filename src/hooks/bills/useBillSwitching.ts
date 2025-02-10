import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BillProduct, BillStatus } from "@/types/bills";
import { useSession } from "@supabase/auth-helpers-react";
import type { Database } from "@/types/supabase";
import { PostgrestError } from "@supabase/supabase-js";

type Tables = Database['public']['Tables'];
type BillRow = Tables['budgetapp_bills']['Row'] & {
  items?: BillProduct[];
};
type BillInsert = Omit<Tables['budgetapp_bills']['Insert'], 'status'> & {
  status: BillStatus;
};

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
      if (!sourceId) {
        console.log('Waiting for source selection...');
        return;
      }
      
      if (!session?.user?.id) {
        console.log('Please log in to view bills');
        return;
      }

      // Check if user has access to this source
      const { data: sourceAccess, error: accessError } = await supabase
        .from('budgetapp_sources')
        .select('id')
        .eq('id', sourceId)
        .eq('user_id', session.user.id)
        .single();

      if (accessError || !sourceAccess) {
        console.log('No access to this source');
        return;
      }

      // Find any existing active bill for this source
      const { data: existingBills, error: fetchError } = await supabase
        .from('budgetapp_bills')
        .select('*')
        .eq('source_id', sourceId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (existingBills && existingBills.length > 0) {
        const activeBill = existingBills[0] as BillRow;
        setActiveBillId(activeBill.id);
        setSelectedProducts(activeBill.items || []);
        console.log('Found existing active bill:', activeBill.id);
      } else {
        await createNewBill();
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error initializing active bill:', err);
      toast({
        title: "Error initializing bill",
        description: err.message,
        variant: "destructive",
      });
    }
  }, [sourceId, setSelectedProducts, toast, session?.user?.id]);

  const createNewBill = async () => {
    if (!sourceId || !session?.user?.id) return null;

    const newBill: BillInsert = {
      source_id: sourceId,
      description: 'New Bill',
      bill_date: new Date().toISOString(),
      status: 'active',
      total: 0
    };

    const { data: createdBill, error } = await supabase
      .from('budgetapp_bills')
      .insert(newBill)
      .select()
      .single();

    if (error) throw error;

    return createdBill as BillRow;
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
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error creating new bill:', err);
      toast({
        title: "Error creating bill",
        description: err.message,
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
        .from('budgetapp_bills')
        .select('*')
        .eq('id', billId)
        .eq('status', 'active')
        .single();

      if (error) throw error;

      if (bill) {
        const billWithItems = bill as BillRow;
        setActiveBillId(billWithItems.id);
        setSelectedProducts(billWithItems.items || []);
        toast({
          title: "Switched bill",
          description: `Now viewing bill #${billWithItems.id.slice(0, 8)}`,
        });
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error switching bill:', err);
      toast({
        title: "Error switching bill",
        description: err.message,
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