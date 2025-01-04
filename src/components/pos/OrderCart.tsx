import { BillProduct } from "@/types/bill";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useBillUpdates } from "@/hooks/bills/useBillUpdates";
import { CartHeader } from "./cart/CartHeader";
import { CartItems } from "./cart/CartItems";
import { CartFooter } from "./cart/CartFooter";
import { useQueryClient } from "@tanstack/react-query";

interface OrderCartProps {
  items: BillProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  sourceId: string;
  setSelectedProducts: (products: BillProduct[]) => void;
}

export const OrderCart = ({
  items = [], // Provide default empty array
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
  } = useBillUpdates(undefined, items || []); // Ensure items is never undefined

  const handleCheckout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: bill, error: billError } = await supabase
        .from('bills')
        .insert({
          source_id: sourceId,
          user_id: user.id,
          status: 'pending',
          items,
          subtotal,
          discount,
          gst: gstAmount,
          total: finalTotal,
          date,
          payer_id: selectedPayerId
        })
        .select()
        .single();

      if (billError) throw billError;

      toast({
        title: "Success",
        description: "Bill created successfully",
      });

      // Clear the cart
      setSelectedProducts([]);
      
      // Invalidate bills query
      queryClient.invalidateQueries({ queryKey: ['bills'] });

    } catch (error) {
      console.error('Error creating bill:', error);
      toast({
        title: "Error",
        description: "Failed to create bill",
        variant: "destructive",
      });
    }
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
        />
      )}
    </div>
  );
};