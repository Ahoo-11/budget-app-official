import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BillProduct, serializeBillItems } from "@/types/bills";
import { useToast } from "@/hooks/use-toast";

interface CartManagerProps {
  sourceId: string;
  selectedProducts: BillProduct[];
  setSelectedProducts: (products: BillProduct[]) => void;
}

export const useCartManager = ({
  sourceId,
  selectedProducts,
  setSelectedProducts
}: CartManagerProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (!sourceId || selectedProducts.length === 0) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('bills')
        .insert({
          source_id: sourceId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          items: serializeBillItems(selectedProducts),
          total: selectedProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          status: 'active',
          date: new Date().toISOString()
        });

      if (error) throw error;

      setSelectedProducts([]);
      toast({
        title: "Success",
        description: "Bill created successfully",
      });
    } catch (error) {
      console.error('Error creating bill:', error);
      toast({
        title: "Error",
        description: "Failed to create bill",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBill = () => {
    setSelectedProducts([]);
  };

  return {
    handleCheckout,
    handleCancelBill,
    isSubmitting
  };
};