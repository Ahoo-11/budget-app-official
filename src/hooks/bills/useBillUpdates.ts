import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bill, BillProduct, PaymentMethod } from "@/types/bills";
import { useQuery } from "@tanstack/react-query";

interface UseBillUpdatesProps {
  sourceId: string;
  onSuccess?: () => void;
}

export function useBillUpdates({
  sourceId,
  onSuccess
}: UseBillUpdatesProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState(new Date());
  const [selectedPayerId, setSelectedPayerId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    },
  });

  const handleSubmit = async (
    products: BillProduct[],
    payerId: string | null,
    paymentMethod: PaymentMethod
  ) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a bill",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the bill first
      const { data: bill, error: billError } = await supabase
        .from("bills")
        .insert({
          source_id: sourceId,
          payer_id: payerId,
          payment_method: paymentMethod,
          status: "active",
          total: calculateTotal(products),
          gst: calculateGST(products),
          subtotal: calculateSubtotal(products),
          user_id: user.id,
          date: date.toISOString(),
        })
        .select()
        .single();

      if (billError) throw billError;

      // Create bill items in a separate table
      const { error: itemsError } = await supabase.rpc('create_bill_items', {
        p_bill_id: bill.id,
        p_items: products.map(product => ({
          item_id: product.id,
          item_type: product.type,
          quantity: product.quantity,
          price: product.price,
          total: product.price * product.quantity,
        }))
      });

      if (itemsError) throw itemsError;

      toast({
        title: "Success",
        description: "Bill created successfully",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      console.error("Error creating bill:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateSubtotal = (products: BillProduct[]) => {
    return products.reduce((total, product) => {
      return total + product.price * product.quantity;
    }, 0);
  };

  const calculateGST = (products: BillProduct[]) => {
    const subtotal = calculateSubtotal(products);
    return subtotal * 0.1; // 10% GST
  };

  const calculateTotal = (products: BillProduct[]) => {
    const subtotal = calculateSubtotal(products);
    const gst = calculateGST(products);
    return subtotal + gst;
  };

  const handlePayerSelect = (payerId: string | null) => {
    setSelectedPayerId(payerId);
  };

  const handleDateChange = (newDate: Date) => {
    setDate(newDate);
  };

  const handleCancel = () => {
    // Reset the form
    setSelectedPayerId(null);
    setDate(new Date());

    if (onSuccess) {
      onSuccess();
    }

    toast({
      title: "Success",
      description: "Bill creation cancelled",
    });
  };

  return {
    isSubmitting,
    date,
    selectedPayerId,
    handleSubmit,
    handleCancel,
    handlePayerSelect,
    handleDateChange,
  };
}