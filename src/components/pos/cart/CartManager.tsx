import { useState } from "react";
import { BillProduct } from "@/types/bill";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { createPosTransaction, completePosTransaction } from "@/services/posTransactions";

export const useCartManager = (
  sourceId: string,
  items: BillProduct[],
  setSelectedProducts: (products: BillProduct[]) => void,
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const session = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleCheckout = async () => {
    if (!sourceId || !session?.user?.id) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const gstRate = 0.08;
      const gstAmount = subtotal * gstRate;
      const total = subtotal + gstAmount;

      // Create transaction
      await createPosTransaction(
        sourceId,
        session.user.id,
        items,
        subtotal,
        0, // discount
        gstAmount,
        total,
        paidAmount
      );

      // Update stock levels
      for (const item of items) {
        if (item.type === 'product' && item.current_stock !== undefined) {
          const newStock = item.current_stock - item.quantity;
          await updateProductStock(item.id, newStock);
        }
      }

      toast({
        title: "Success",
        description: "Transaction completed successfully",
      });

      // Reset cart
      setSelectedProducts([]);
      setPaidAmount(0);
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: "Error",
        description: "Failed to complete transaction",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBill = () => {
    setSelectedProducts([]);
    setPaidAmount(0);
  };

  return {
    isSubmitting,
    paidAmount,
    setPaidAmount,
    handleCheckout,
    handleCancelBill,
  };
};

const updateProductStock = async (productId: string, newStock: number) => {
  const { error } = await supabase
    .from('products')
    .update({ current_stock: newStock })
    .eq('id', productId);

  if (error) throw error;
};