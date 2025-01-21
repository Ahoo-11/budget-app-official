import { BillProduct } from "@/types/bills";
import { CartHeader } from "./cart/CartHeader";
import { CartItems } from "./cart/CartItems";
import { CartFooter } from "./cart/CartFooter";
import { PaymentMethodSelector } from "./cart/PaymentMethodSelector";
import { useCartManager } from "./cart/CartManager";
import { useCartCalculations } from "@/hooks/cart/useCartCalculations";
import { useBillUpdates } from "@/hooks/bills/useBillUpdates";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface OrderCartProps {
  products: BillProduct[];
  onProductsChange: (products: BillProduct[]) => void;
  sourceId: string;
}

export const OrderCart = ({
  products,
  onProductsChange,
  sourceId,
}: OrderCartProps) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('transfer');

  const {
    discount,
    setDiscount,
    subtotal,
    gstAmount,
    finalTotal
  } = useCartCalculations(products);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    onProductsChange(
      products.map((p) =>
        p.id === productId ? { ...p, quantity } : p
      )
    );
  };

  const handleRemoveProduct = (productId: string) => {
    onProductsChange(products.filter((p) => p.id !== productId));
  };

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
        .select('id')
        .eq('source_id', sourceId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;
      return data;
    }
  });

  if (!activeSession) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No active session found. Please start a new session to create bills.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <CartHeader
        date={date}
        onDateChange={handleDateChange}
        selectedPayerId={selectedPayerId}
        onPayerSelect={handlePayerSelect}
      />

      <CartItems
        products={products}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveProduct}
      />

      <CartFooter
        subtotal={subtotal}
        discount={discount}
        setDiscount={setDiscount}
        gstAmount={gstAmount}
        finalTotal={finalTotal}
        sourceId={sourceId}
        products={products}
        onProductsChange={onProductsChange}
        paymentMethod={paymentMethod}
        isBillSubmitting={isBillSubmitting}
      />

      <PaymentMethodSelector
        value={paymentMethod}
        onChange={setPaymentMethod}
      />
    </div>
  );
};