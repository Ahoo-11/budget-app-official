import { useState } from "react";
import { BillProduct } from "@/types/bill";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useBillUpdates } from "@/hooks/bills/useBillUpdates";
import { CartHeader } from "./CartHeader";
import { CartItems } from "./CartItems";
import { CartFooter } from "./CartFooter";
import { PaymentInput } from "./PaymentInput";
import { useQueryClient } from "@tanstack/react-query";
import { serializeBillItems } from "../BillManager";
import { createBillTransaction } from "./TransactionCreator";

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
  const [paidAmount, setPaidAmount] = useState(0);
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
    if (!sourceId) {
      toast({
        title: "Error",
        description: "Source ID is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create bill with paid amount
      const billData = {
        source_id: sourceId,
        user_id: user.id,
        status: 'pending', // Initial status, will be updated by trigger
        items: serializeBillItems(items),
        subtotal,
        discount,
        gst: gstAmount,
        total: finalTotal,
        date: date.toISOString(),
        payer_id: selectedPayerId || null,
        type_id: null,
        paid_amount: paidAmount
      };

      const { error: billError } = await supabase
        .from('bills')
        .insert(billData);

      if (billError) {
        console.error('Error creating bill:', billError);
        throw billError;
      }

      // Create transaction record (always)
      await createBillTransaction(
        sourceId,
        user.id,
        paidAmount,
        finalTotal,
        selectedPayerId,
        date,
        items
      );

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

      toast({
        title: "Success",
        description: "Bill created successfully",
      });

      setSelectedProducts([]);
      setPaidAmount(0);
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
    setPaidAmount(0);
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
        <>
          <div className="border-t p-4">
            <PaymentInput
              total={finalTotal}
              paidAmount={paidAmount}
              onPaidAmountChange={setPaidAmount}
            />
          </div>
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
        </>
      )}
    </div>
  );
};