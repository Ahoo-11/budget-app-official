import { BillProduct } from "@/types/bill";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useBillUpdates } from "./bill/useBillUpdates";
import { CartHeader } from "./cart/CartHeader";
import { CartItems } from "./cart/CartItems";
import { CartFooter } from "./cart/CartFooter";

interface OrderCartProps {
  items: BillProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: (payerId?: string) => void;
  isSubmitting?: boolean;
  activeBillId?: string;
  defaultPayerId?: string;
}

export const OrderCart = ({
  items,
  onUpdateQuantity,
  onRemove,
  onCheckout,
  isSubmitting = false,
  activeBillId,
  defaultPayerId,
}: OrderCartProps) => {
  const { toast } = useToast();
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
  } = useBillUpdates(activeBillId, items);

  const handleCheckout = () => {
    onCheckout(selectedPayerId || defaultPayerId);
  };

  const handleCancelBill = async () => {
    if (!activeBillId) return;

    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', activeBillId);

      if (error) throw error;

      toast({
        title: "Bill cancelled",
        description: "The bill has been successfully cancelled.",
      });

      window.location.reload();
    } catch (error) {
      console.error('Error cancelling bill:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the bill. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white h-full flex flex-col border rounded-lg">
      <CartHeader
        selectedPayerId={selectedPayerId || defaultPayerId || ''}
        date={date}
        onPayerSelect={handlePayerSelect}
        onDateChange={handleDateChange}
        defaultPayerId={defaultPayerId}
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
          isSubmitting={isSubmitting}
          onDiscountChange={handleDiscountChange}
          onCheckout={handleCheckout}
          onCancelBill={handleCancelBill}
        />
      )}
    </div>
  );
};