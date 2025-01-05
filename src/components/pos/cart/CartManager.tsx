import { useState } from "react";
import { BillProduct } from "@/types/bill";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

      // Create bill
      const { error: billError } = await supabase
        .from('bills')
        .insert({
          source_id: sourceId,
          user_id: session.user.id,
          status: 'pending',
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            type: item.type,
            source_id: sourceId,
            category: item.category,
            image_url: item.image_url,
            description: item.description
          })),
          subtotal,
          gst: gstAmount,
          total,
          paid_amount: paidAmount,
          date: new Date().toISOString(),
        });

      if (billError) throw billError;

      // Update stock levels for products
      for (const item of items) {
        if (item.type === 'product' && item.current_stock !== undefined) {
          const newStock = item.current_stock - item.quantity;
          
          const { error: stockError } = await supabase
            .from('products')
            .update({ current_stock: newStock })
            .eq('id', item.id);

          if (stockError) throw stockError;

          // Create stock movement record
          const { error: movementError } = await supabase
            .from('stock_movements')
            .insert({
              product_id: item.id,
              movement_type: 'sale',
              quantity: -item.quantity,
              unit_cost: item.price,
              notes: `POS Sale`,
              created_by: session.user.id
            });

          if (movementError) throw movementError;
        }
      }

      toast({
        title: "Success",
        description: "Bill created successfully",
      });

      // Reset cart
      setSelectedProducts([]);
      setPaidAmount(0);
      
      // Refresh queries
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });

    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: "Error",
        description: "Failed to complete checkout",
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