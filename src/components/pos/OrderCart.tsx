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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create bill data object, explicitly setting null for empty values
      const billData = {
        source_id: sourceId || null,
        user_id: user.id || null,
        status: 'pending',
        items: serializeBillItems(items),
        subtotal,
        discount,
        gst: gstAmount,
        total: finalTotal,
        date: date.toISOString(),
        payer_id: selectedPayerId || null,
        type_id: null // Explicitly set to null if not used
      };

      // Validate required UUIDs
      if (!billData.source_id) throw new Error("Source ID is required");
      if (!billData.user_id) throw new Error("User ID is required");

      const { error: billError } = await supabase
        .from('bills')
        .insert(billData);

      if (billError) {
        console.error('Error creating bill:', billError);
        throw billError;
      }

      toast({
        title: "Success",
        description: "Bill created successfully",
      });

      setSelectedProducts([]);
      queryClient.invalidateQueries({ queryKey: ['bills'] });

    } catch (error) {
      console.error('Error creating bill:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create bill",
        variant: "destructive",
      });
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
        />
      )}
    </div>
  );
};