import { BillProduct } from "@/types/bills";
import { CartHeader } from "./CartHeader";
import { CartItems } from "./CartItems";
import { CartFooter } from "./CartFooter";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { useCartManager } from "./CartManager";
import { useCartCalculations } from "@/hooks/cart/useCartCalculations";
import { useBillUpdates } from "@/hooks/bills/useBillUpdates";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface OrderCartProps {
  selectedProducts: BillProduct[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  sourceId: string;
  setSelectedProducts: (products: BillProduct[]) => void;
}

export const OrderCart = ({
  selectedProducts,
  onUpdateQuantity,
  onRemove,
  sourceId,
  setSelectedProducts,
}: OrderCartProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('transfer');

  const {
    discount,
    setDiscount,
    subtotal,
    gstAmount,
    finalTotal
  } = useCartCalculations(selectedProducts);

  const {
    isSubmitting: isBillSubmitting,
    date,
    selectedPayerId,
    handlePayerSelect,
    handleDateChange,
  } = useBillUpdates();

  const { data: activeSession } = useQuery({
    queryKey: ['active-session', sourceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('source_id', sourceId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const {
    handleCheckout,
    handleCancelBill,
    isSubmitting: isCartSubmitting
  } = useCartManager({
    sourceId,
    selectedProducts,
    setSelectedProducts,
    paymentMethod
  });

  const handleCheckoutClick = () => {
    handleCheckout(
      subtotal,
      discount,
      gstAmount,
      finalTotal
    );
  };

  return (
    <div className="bg-white h-full flex flex-col border rounded-lg">
      <CartHeader
        selectedPayerId={selectedPayerId}
        date={date}
        onPayerSelect={handlePayerSelect}
        onDateChange={handleDateChange}
      />

      {!activeSession && (
        <Alert variant="destructive" className="m-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No active session found. Please start a new session to create bills.
          </AlertDescription>
        </Alert>
      )}

      <div className="border-t p-4">
        <h3 className="font-medium text-lg">Order Summary</h3>
      </div>

      <CartItems
        selectedProducts={selectedProducts}
        onUpdateQuantity={onUpdateQuantity}
        onRemove={onRemove}
      />

      {selectedProducts.length > 0 && (
        <>
          <div className="border-t p-4">
            <PaymentMethodSelector
              method={paymentMethod}
              onMethodChange={setPaymentMethod}
            />
          </div>
          <CartFooter
            subtotal={subtotal}
            gstAmount={gstAmount}
            discount={discount}
            finalTotal={finalTotal}
            onDiscountChange={setDiscount}
            onCheckout={handleCheckoutClick}
            onCancelBill={handleCancelBill}
            selectedPayerId={selectedPayerId}
            isSubmitting={isBillSubmitting || isCartSubmitting}
            disabled={!activeSession}
            paymentMethod={paymentMethod}
          />
        </>
      )}
    </div>
  );
};