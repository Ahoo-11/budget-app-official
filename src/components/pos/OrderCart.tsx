import { useState } from "react";
import { BillProduct } from "@/types/bill";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBillUpdates } from "@/hooks/bills/useBillUpdates";
import { CartHeader } from "./cart/CartHeader";
import { CartItems } from "./cart/CartItems";
import { CartFooter } from "./cart/CartFooter";
import { useQueryClient } from "@tanstack/react-query";
import { serializeBillItems } from "./BillManager";
import { getBillStatus } from "@/utils/creditUtils";

interface OrderCartProps {
  items: BillProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  sourceId: string;
  setSelectedProducts: (products: BillProduct[]) => void;
}

export const OrderCart = ({
  items = [],
  onUpdateQuantity,
  onRemove,
  sourceId,
  setSelectedProducts,
}: OrderCartProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const {
    discount,
    date,
    selectedPayerId,
    subtotal,
    gstAmount,
    finalTotal,
    handlePayerSelect,
    handleDateChange,
    handleDiscountChange
  } = useBillUpdates(undefined, items);

  const handleCheckout = async () => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Determine bill status based on payer and credit terms
      const status = selectedPayerId 
        ? await getBillStatus(date, sourceId, selectedPayerId)
        : 'completed';

      console.log('Creating bill with status:', status);

      const billData = {
        source_id: sourceId,
        user_id: user.id,
        status,
        items: serializeBillItems(items),
        subtotal,
        discount,
        gst: gstAmount,
        total: finalTotal,
        date: date.toISOString(),
        payer_id: selectedPayerId || null,
        type_id: null
      };

      const { error: billError } = await supabase
        .from('bills')
        .insert(billData);

      if (billError) {
        console.error('Error creating bill:', billError);
        throw billError;
      }

      // Update stock levels for products
      for (const item of items) {
        if (item.type === 'product') {
          const { error: stockError } = await supabase
            .from('products')
            .update({ 
              current_stock: item.current_stock - item.quantity 
            })
            .eq('id', item.id);

          if (stockError) {
            console.error('Error updating stock:', stockError);
            throw stockError;
          }

          // Create stock movement record
          const { error: movementError } = await supabase
            .from('stock_movements')
            .insert({
              product_id: item.id,
              movement_type: 'sale',
              quantity: -item.quantity,
              unit_cost: item.price,
              notes: `Sale from bill`,
              created_by: user.id
            });

          if (movementError) {
            console.error('Error creating stock movement:', movementError);
            throw movementError;
          }
        }
      }

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          source_id: sourceId,
          user_id: user.id,
          description: `POS Sale`,
          amount: finalTotal,
          type: 'income',
          date: date,
          payer_id: selectedPayerId,
          status: status === 'completed' ? 'completed' : 'pending',
          created_by_name: user.email
        });

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        throw transactionError;
      }

      toast({
        title: "Success",
        description: status === 'completed' 
          ? "Payment completed successfully"
          : "Bill charged to account successfully",
      });

      setSelectedProducts([]);
      queryClient.invalidateQueries({ queryKey: ['bills'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });

    } catch (error) {
      console.error('Error during checkout:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete checkout",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBill = () => {
    setSelectedProducts([]);
  };

  return (
    <div className="bg-white h-full flex flex-col border rounded-lg">
      <CartHeader
        selectedPayerId={selectedPayerId}
        date={date}
        onPayerSelect={handlePayerSelect}
        onDateChange={handleDateChange}
      />

      <div className="border-t p-4">
        <h3 className="font-medium text-lg">Order Summary</h3>
      </div>

      <CartItems
        items={items}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />

      {items.length > 0 && (
        <CartFooter
          subtotal={subtotal}
          gstAmount={gstAmount}
          discount={discount}
          finalTotal={finalTotal}
          onDiscountChange={handleDiscountChange}
          onCheckout={handleCheckout}
          onCancelBill={handleCancelBill}
          selectedPayerId={selectedPayerId}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};