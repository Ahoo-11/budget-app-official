import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BillProduct, serializeBillItems } from "@/types/bills";
import { toast } from "sonner";

export const useBillManager = (sourceId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getActiveSession = async () => {
    const { data: activeSession, error } = await supabase
      .from('budgetapp_sessions')
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

      const userId = (await supabase.auth.getUser()).data.user?.id;
      const billItems = serializeBillItems(items);
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const discount = 0;
      const gst = 0;
      const total = subtotal - discount + gst;
      const paidAmount = 0;
      const status = "pending";
      const paymentMethod = "";
      const date = new Date().toISOString();
      const sessionId = activeSession.id;

      const { data: bill, error } = await supabase
        .from('budgetapp_bills')
        .insert({
          source_id: sourceId,
          user_id: userId,
          items: billItems,
          subtotal: subtotal,
          discount: discount,
          gst: gst,
          total: total,
          paid_amount: paidAmount,
          status: status,
          payment_method: paymentMethod,
          date: date,
          session_id: sessionId
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