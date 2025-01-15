import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BillProduct, serializeBillItems } from "@/types/bills";
import { toast } from "sonner";

export const useBillManager = (sourceId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getActiveSession = async () => {
    const { data: activeSession, error } = await supabase
      .from('sessions')
      .select('id')
      .eq('source_id', sourceId)
      .eq('status', 'active')
      .maybeSingle();

    if (error) {
      console.error("Error fetching active session:", error);
      throw error;
    }

    return activeSession;
  };

  const createBill = async (items: BillProduct[]) => {
    try {
      setIsSubmitting(true);

      // First get active session
      const activeSession = await getActiveSession();

      if (!activeSession?.id) {
        toast.error("No active session found. Please start a new session.");
        return null;
      }

      const { data: bill, error } = await supabase
        .from("bills")
        .insert({
          source_id: sourceId,
          items: serializeBillItems(items),
          status: "pending",
          total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
          user_id: (await supabase.auth.getUser()).data.user?.id,
          date: new Date().toISOString(),
          session_id: activeSession.id
        })
        .select()
        .single();

      if (error) {
        toast.error("Error creating bill");
        throw error;
      }

      toast.success("Bill created successfully");
      return bill;
    } catch (error) {
      console.error("Error in createBill:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createBill,
    isSubmitting,
  };
};